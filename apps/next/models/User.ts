import { User } from "@/schemas/User.monko";
import { createModel } from "@monkko/orm/models";
import { MongoClient } from "@/lib/MongoClient";
import type { OrganisationDocument } from "./Organisation";
import type { ObjectId } from "mongodb";

// Base document type - what's stored in the database
export type UserDocument = {
  _id: ObjectId;
  name: string;
  email: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  organisationId?: ObjectId;
};

// Document type with populated organisation
export type UserDocumentPopulated = {
  _id: ObjectId;
  name: string;
  email: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  organisationId?: OrganisationDocument;
};

const userModel = createModel<UserDocument>(User, MongoClient);

export default userModel;