import { User } from "@/schemas/User.monko";
import { createModel } from "@monko/orm/models/createModel";
import { MongoClient } from "@/lib/MongoClient";

const userModel = createModel(User, MongoClient);

export default userModel;