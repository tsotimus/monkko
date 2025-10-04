import type { ObjectId } from 'mongodb';

export type UserDocument = {
  _id: ObjectId;
  age?: number;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateUserInput = Omit<UserDocument, '_id' | 'createdAt' | 'updatedAt'>;

export type UpdateUserInput = Partial<CreateUserInput>;
