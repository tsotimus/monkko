import type { SchemaDefinition } from "../schemas/defineSchema";
import type { MonkoClient } from "../connections/createConnection";
import type { Filter, Document, UpdateFilter, OptionalUnlessRequiredId } from "mongodb";
import type { Model, QueryBuilder, SingleQueryBuilder } from "./types";

import { createQueryBuilder, registerSchema } from "./query-builder";

export function createModel<
  Doc extends Document,
  S extends SchemaDefinition = SchemaDefinition
>(
  schema: S, 
  monkoClient: MonkoClient
): Model<Doc> {
  const coll = monkoClient.client.db(schema.db).collection<Doc>(schema.collection);
  
  // Register the schema for populate functionality
  registerSchema(schema);

  return {
    find(filter: Filter<Doc> = {}): QueryBuilder<Doc> {
      return createQueryBuilder<Doc>(coll, schema, monkoClient, filter, true) as QueryBuilder<Doc>;
    },
    
    findOne(filter: Filter<Doc>): SingleQueryBuilder<Doc> {
      return createQueryBuilder<Doc>(coll, schema, monkoClient, filter, false) as SingleQueryBuilder<Doc>;
    },
    
    update(filter: Filter<Doc>, update: UpdateFilter<Doc>) {
      // Note: Timestamp functionality is currently limited by MongoDB's strict TypeScript definitions
      // The user's Doc type should include createdAt/updatedAt fields when timestamps are enabled
      // but MongoDB's UpdateFilter type doesn't recognize dynamically added fields
      
      // For now, we disable timestamps in update operations to maintain type safety
      // TODO: Implement proper timestamp support when MongoDB's types are more flexible
      return coll.updateOne(filter, update);
    },
    
    create(doc: OptionalUnlessRequiredId<Doc>) {
      if (schema.options?.timestamps) {
        const now = new Date();
        // Use Object.assign to merge timestamp fields
        const docWithTimestamps = Object.assign({}, doc, {
          createdAt: now,
          updatedAt: now,
        });
        
        return coll.insertOne(docWithTimestamps);
      }
      return coll.insertOne(doc);
    },
    
    delete(filter: Filter<Doc>) {
      return coll.deleteOne(filter);
    },
  };
}