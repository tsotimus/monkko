import { defineSchema } from "@monko/orm/schemas/defineSchema";
import { defineSubDocument } from "@monko/orm/schemas/defineSubDocument";
import { fields } from "@monko/orm/fields/index";


export const Address = defineSubDocument({
  street: fields.string({ required: true }),
  city: fields.string({ required: true }),
  state: fields.string({ required: true }),
  zip: fields.string({ required: true })
});

export const User = defineSchema({
  name: "User",
  db: "monko-test",
  collection: "users",
  fields: {
    name: fields.string({ required: true }),
    email: fields.string({ required: true, unique: true }),
    address: Address({optional: true})
  }
});
