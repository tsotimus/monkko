import { defineSchema, fields } from "@monko/orm/schemas";

export const Organisation = defineSchema({
  name: "Organisation",
  db: "monko-test",
  collection: "organisations",
  fields: {
    name: fields.string({ required: true }),
    description: fields.string({ required: false }),
    website: fields.string({ required: false }),
    industry: fields.string({ required: false })
  }
});
