import type { SchemaDefinition } from "../schemas/defineSchema";
import type { InferMonkoFieldType } from "../fields/types";
import type { MonkoClient } from "../connections/createConnection";
import type { DeleteResult, Filter, InsertOneResult, OptionalUnlessRequiredId, UpdateFilter, UpdateResult, WithId } from "mongodb";

export interface Model<Doc> {
  find(filter: Filter<Doc>): Promise<WithId<Doc>[]>;
  findOne(filter: Filter<Doc>): Promise<WithId<Doc> | null>;
  create(doc: OptionalUnlessRequiredId<Doc>): Promise<InsertOneResult<Doc>>;
  update(filter: Filter<Doc>, update: UpdateFilter<Doc>): Promise<UpdateResult>;
  delete(filter: Filter<Doc>): Promise<DeleteResult>;
}

export function createModel<
  const S extends SchemaDefinition
>(schema: S, monkoClient: MonkoClient): Model<{ [K in keyof S["fields"]]: InferMonkoFieldType<S["fields"][K]> }> {
  type Doc = {
    [K in keyof S["fields"]]: InferMonkoFieldType<S["fields"][K]>;
  };

  const coll = monkoClient.client.db(schema.db).collection<Doc>(schema.collection);

  return {
    find(filter: Filter<Doc>) {
      return coll.find(filter).toArray();
    },
    findOne(filter: Filter<Doc>) {
      return coll.findOne(filter);
    },
    update(filter: Filter<Doc>, update: UpdateFilter<Doc>) {
      return coll.updateOne(filter, update);
    },
    create(doc: OptionalUnlessRequiredId<Doc>) {
      return coll.insertOne(doc);
    },
    delete(filter: Filter<Doc>) {
      return coll.deleteOne(filter);
    },
  };
}