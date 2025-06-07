import type { ObjectId } from 'mongodb';

export type ProductDocument = {
  _id: ObjectId;
}

export type CreateProductInput = Omit<ProductDocument, '_id'>;

export type UpdateProductInput = Partial<CreateProductInput>;
