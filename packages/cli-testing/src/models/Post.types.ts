import type { ObjectId } from 'mongodb';

export type PostDocument = {
  _id: ObjectId;
}

export type CreatePostInput = Omit<PostDocument, '_id'>;

export type UpdatePostInput = Partial<CreatePostInput>;
