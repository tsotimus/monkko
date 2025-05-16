import type { SchemaDefinition } from "../schemas/defineSchema";
import type { InferMonkoFieldType } from "../fields/types";
import type { MonkoClient } from "../connections/createConnection";
import type { Filter, OptionalUnlessRequiredId, UpdateFilter } from "mongodb";

export function createModel<
  const S extends SchemaDefinition
>(schema: S, monkoClient: MonkoClient) {
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
    insert(doc: OptionalUnlessRequiredId<Doc>) {
      return coll.insertOne(doc);
    },
    update(filter: Filter<Doc>, update: UpdateFilter<Doc>) {
      return coll.updateOne(filter, update);
    },
    delete(filter: Filter<Doc>) {
      return coll.deleteOne(filter);
    },
  };
}