import type { ObjectId } from 'mongodb';

export type UserDocument = {
  _id: ObjectId;
}

export type CreateUserInput = Omit<UserDocument, '_id'>;

export type UpdateUserInput = Partial<CreateUserInput>;
