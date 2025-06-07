import type { ObjectId } from 'mongodb';

export type ProductDocument = {
  _id: ObjectId;
  description?: string;
  inStock: boolean;
  name: string;
  price: number;
}

export type CreateProductInput = Omit<ProductDocument, '_id'>;

export type UpdateProductInput = Partial<CreateProductInput>;
