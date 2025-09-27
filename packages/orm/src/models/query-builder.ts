import type { SchemaDefinition } from "../schemas/defineSchema";
import type { MonkoClient } from "../connections/createConnection";
import type { Filter, WithId, Collection, Document } from "mongodb";
import { ObjectId } from "mongodb";
import type { PopulateOptions } from "./types";
import type { ObjectIdField } from "../schemas/fields/field-types/objectId";

// Internal populate info
interface PopulateInfo {
  fields: string[];
  options: PopulateOptions;
}

// Global registry for schemas to help with populate
const schemaRegistry = new Map<string, SchemaDefinition>();

export function registerSchema(schema: SchemaDefinition) {
  schemaRegistry.set(schema.name, schema);
}

export function createQueryBuilder<Doc extends Document>(
  collection: Collection<Doc>,
  schema: SchemaDefinition,
  monkoClient: MonkoClient,
  filter: Filter<Doc>,
  isArray: boolean = true
) {
  const populates: PopulateInfo[] = [];

  const executeQuery = async (): Promise<WithId<Doc>[] | WithId<Doc> | null> => {
    // Get the base documents first
    const docs = isArray 
      ? await collection.find(filter || {}).toArray()
      : await collection.findOne(filter);

    if (!docs || (Array.isArray(docs) && docs.length === 0)) {
      return docs;
    }

    // Process populates
    const documentsToProcess = Array.isArray(docs) ? docs : [docs];
    
    for (const populateInfo of populates) {
      // For now, we'll implement only the multiple queries strategy
      if (populateInfo.options.strategy === 'multiple' || populateInfo.options.strategy === undefined) {
        await executePopulateWithMultipleQueries(
          documentsToProcess, 
          populateInfo, 
          schema, 
          monkoClient
        );
      }
      // TODO: Add aggregation strategy implementation
    }

    return docs;
  };

  const builder = {
    populate(fields: string | string[], options: PopulateOptions = {}) {
      const fieldArray = Array.isArray(fields) ? fields : [fields];
      
      // Default strategy based on total field count across all populate calls
      const totalFields = populates.reduce((acc, p) => acc + p.fields.length, 0) + fieldArray.length;
      const defaultStrategy = totalFields >= 2 ? 'aggregation' : 'multiple';
      
      populates.push({
        fields: fieldArray,
        options: { strategy: defaultStrategy, ...options }
      });
      
      return builder;
    },

    // Keep exec() for backward compatibility
    async exec(): Promise<WithId<Doc>[] | WithId<Doc> | null> {
      return executeQuery();
    },

    // Make it thenable (awaitable)
    then<TResult1 = WithId<Doc>[] | WithId<Doc> | null, TResult2 = never>(
      onfulfilled?: ((value: WithId<Doc>[] | WithId<Doc> | null) => TResult1 | PromiseLike<TResult1>) | undefined | null,
      onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | undefined | null
    ): PromiseLike<TResult1 | TResult2> {
      return executeQuery().then(onfulfilled, onrejected);
    }
  };

  return builder;
}

async function executePopulateWithMultipleQueries<Doc>(
  documents: WithId<Doc>[],
  populateInfo: PopulateInfo,
  schema: SchemaDefinition,
  monkoClient: MonkoClient
) {
  for (const fieldName of populateInfo.fields) {
    // Find the field definition in the schema
    const fieldDef = schema.fields[fieldName];
    
    if (!fieldDef || fieldDef.type !== 'objectId') {
      console.warn(`Field ${fieldName} is not an ObjectId field or doesn't exist in schema`);
      continue;
    }

    // Get the ref from the field definition
    const ref = (fieldDef as ObjectIdField).ref;
    if (!ref) {
      console.warn(`Field ${fieldName} doesn't have a ref property`);
      continue;
    }

    // Get the referenced schema to find the correct collection
    const referencedSchema = schemaRegistry.get(ref);
    if (!referencedSchema) {
      console.warn(`Referenced schema ${ref} not found in registry. Make sure to register all schemas.`);
      continue;
    }

    // Collect all the IDs to populate
    const idsToPopulate = new Set<string>();
    
    documents.forEach(doc => {
      const fieldValue = (doc as Record<string, unknown>)[fieldName];
      if (fieldValue) {
        if (Array.isArray(fieldValue)) {
          fieldValue.forEach(id => {
            if (id) idsToPopulate.add(id.toString());
          });
        } else {
          idsToPopulate.add(fieldValue.toString());
        }
      }
    });

    if (idsToPopulate.size === 0) continue;

    // Convert string IDs back to ObjectIds for the query
    const objectIds: ObjectId[] = [];
    const stringIds: string[] = [];
    
    Array.from(idsToPopulate).forEach(id => {
      try {
        objectIds.push(new ObjectId(id));
      } catch {
        stringIds.push(id); // In case it's not a valid ObjectId, keep as string
      }
    });

    // Get the referenced collection
    const refCollection = monkoClient.client
      .db(referencedSchema.db)
      .collection(referencedSchema.collection);
    
    // Create query filter that handles both ObjectId and string IDs
    const queryFilter: Record<string, unknown> = {};
    if (objectIds.length > 0 && stringIds.length > 0) {
      queryFilter._id = { $in: [...objectIds, ...stringIds] };
    } else if (objectIds.length > 0) {
      queryFilter._id = { $in: objectIds };
    } else if (stringIds.length > 0) {
      queryFilter._id = { $in: stringIds };
    }
    
    // Fetch the referenced documents
    const referencedDocs = await refCollection.find(queryFilter).toArray();

    // Create a map for quick lookup
    const referencedMap = new Map();
    referencedDocs.forEach(doc => {
      referencedMap.set(doc._id.toString(), doc);
    });

    // Replace the IDs with the actual documents
    documents.forEach(doc => {
      const docRecord = doc as Record<string, unknown>;
      const fieldValue = docRecord[fieldName];
      
      if (fieldValue) {
        if (Array.isArray(fieldValue)) {
          docRecord[fieldName] = fieldValue.map(id => {
            const refDoc = referencedMap.get(id.toString());
            return refDoc || id; // Keep original ID if not found
          });
        } else {
          const refDoc = referencedMap.get(fieldValue.toString());
          docRecord[fieldName] = refDoc || fieldValue; // Keep original ID if not found
        }
      }
    });
  }
} 