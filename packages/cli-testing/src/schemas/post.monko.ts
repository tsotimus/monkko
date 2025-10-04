import { defineSchema, fields } from "@monkko/orm";

export const User = defineSchema({
  name: "User",
  db: "myapp",
  collection: "users",
  fields: {
    name: fields.string({ required: true }),
    email: fields.string({ required: true, unique: true }),
    age: fields.number({ required: false }),
    isActive: fields.boolean({ required: true })
  },
  options: { timestamps: true }
});

export const Post = defineSchema({
  name: "Post",
  db: "myapp", 
  collection: "posts",
  fields: {
    title: fields.string({ required: true }),
    content: fields.string({ required: true }),
    authorId: fields.objectId({ required: true }),
    publishedAt: fields.date({ required: false }),
  },
  options: { timestamps: true }
}); 