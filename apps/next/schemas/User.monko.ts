import { defineSchema } from "@monko/orm/schemas/defineSchema";
import { fields } from "@monko/orm/fields/index";

export const User = defineSchema({
  name: "User",
  db: "test",
  collection: "users",
  fields: {
    name: fields.string({ required: true }),
    email: fields.string({ required: true, unique: true })
  }
});
