import { defineSchema, fields } from "@monkko/orm";

export const Product = defineSchema({
  name: "Product",
  db: "shop",
  collection: "products",
  fields: {
    name: fields.string({ required: true }),
    price: fields.number({ required: true }),
    description: fields.string({ required: false }),
    inStock: fields.boolean({ required: true })
  },
}); 