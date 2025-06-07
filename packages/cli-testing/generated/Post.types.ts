import type { ObjectId } from 'mongodb';

export type PostDocument = {
  _id: ObjectId;
  authorId: ObjectId;
  content: string;
  publishedAt?: Date;
  tags?: any;
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

export type CreatePostInput = Omit<PostDocument, '_id' | 'createdAt' | 'updatedAt'>;

export type UpdatePostInput = Partial<CreatePostInput>;
