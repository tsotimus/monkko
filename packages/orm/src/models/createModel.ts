import type { SchemaDefinition } from "../schemas/defineSchema";
import type { MonkoClient } from "../connections/createConnection";
import type { DeleteResult, Filter, InsertOneResult, OptionalUnlessRequiredId, UpdateFilter, UpdateResult, WithId } from "mongodb";

export interface Model<Doc> {
  find<T = Doc>(filter: Filter<Doc>): Promise<WithId<T>[]>;
  findOne<T = Doc>(filter: Filter<Doc>): Promise<WithId<T> | null>;
  create(doc: OptionalUnlessRequiredId<Doc>): Promise<InsertOneResult<Doc>>;
  update(filter: Filter<Doc>, update: UpdateFilter<Doc>): Promise<UpdateResult>;
  delete(filter: Filter<Doc>): Promise<DeleteResult>;
}

export function createModel<Doc>(
  schema: SchemaDefinition, 
  monkoClient: MonkoClient
): Model<Doc> {
  const coll = monkoClient.client.db(schema.db).collection(schema.collection) as any;

  return {
    find<T = Doc>(filter: Filter<Doc>) {
      return coll.find(filter).toArray() as Promise<WithId<T>[]>;
    },
    findOne<T = Doc>(filter: Filter<Doc>) {
      return coll.findOne(filter) as Promise<WithId<T> | null>;
    },
    update(filter: Filter<Doc>, update: UpdateFilter<Doc>) {
      if (schema.options?.timestamps) {
        const updatedFilter = { ...update } as any;
        if (!updatedFilter.$set) {
          updatedFilter.$set = {};
        }
        updatedFilter.$set.updatedAt = new Date();
        return coll.updateOne(filter, updatedFilter);
      }
      return coll.updateOne(filter, update);
    },
    create(doc: OptionalUnlessRequiredId<Doc>) {
      if (schema.options?.timestamps) {
        const docWithTimestamps = {
          ...doc,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as OptionalUnlessRequiredId<Doc>;
        return coll.insertOne(docWithTimestamps);
      }
      return coll.insertOne(doc);
    },
    delete(filter: Filter<Doc>) {
      return coll.deleteOne(filter);
    },
  };
}