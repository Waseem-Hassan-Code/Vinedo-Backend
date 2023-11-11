import mongoose from "mongoose";

const UserShema = new mongoose.Schema({
  avatar: {
    url: { type: String, default: `https://via.placeholder.com/200x200.png` },
    localPath: { type: String, default: "" },
  },
  name: { type: String, required: true },
  authentication: {
    password: { type: String, required: true, select: false },
    salt: { type: String, select: false },
    sessionToken: { type: String, select: false },
  },
  email: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  phoneNumber: { type: String, required: true },
  location: { type: String, required: true },
  isDeleted: { type: Boolean, default: false },
  isContentCreator: { type: Boolean, default: false },
  isBlocked: { type: Boolean, default: false },
});

export const UserModel = mongoose.model("user", UserShema);

export const updateUserPassword = (
  email: String,
  Password: String,
  salt: String
) => {
  return UserModel.findOneAndUpdate(
    { email: email },
    {
      "authentication.salt": salt,
      "authentication.password": Password,
    },
    { new: true }
  );
};

export const getUsers = () => UserModel.find();
export const getUserByEmail = (email: string) => UserModel.findOne({ email });
export const getUserBySessionToken = (sessionToken: string) =>
  UserModel.findOne({ "authentication.sessionToken": sessionToken });

export const getUserById = (id: string) => UserModel.findById(id);
export const createUser = (values: Record<string, any>) =>
  new UserModel(values).save().then((user) => user.toObject());

export const deleteUserById = (id: string) => {
  return UserModel.findOneAndUpdate(
    { _id: id },
    { $set: { isDeleted: true } },
    { new: true }
  );
};

export const addProfilePicture = (id: string, imgPath: string) => {
  return UserModel.findOneAndUpdate(
    { _id: id },
    { $set: { "avatar.localPath": imgPath } },
    { new: true }
  );
};

export const updateUserById = (id: string, values: Record<string, any>) =>
  UserModel.findByIdAndUpdate(id, values, { new: true });
