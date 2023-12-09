import mongoose from "mongoose";

/**
 * @openapi
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         avatar:
 *           type: object
 *           properties:
 *             url:
 *               type: string
 *               default: "https://via.placeholder.com/200x200.png"
 *             localPath:
 *               type: string
 *               default: ""
 *         name:
 *           type: string
 *           description: The name of the user.
 *           required: true
 *         authentication:
 *           type: object
 *           properties:
 *             password:
 *               type: string
 *               required: true
 *               description: The password of the user.
 *             salt:
 *               type: string
 *               description: The salt used for password hashing.
 *             sessionToken:
 *               type: string
 *               description: The session token of the user.
 *         email:
 *           type: string
 *           required: true
 *           description: The email address of the user.
 *         dateOfBirth:
 *           type: string
 *           format: date
 *           required: true
 *           description: The date of birth of the user.
 *         phoneNumber:
 *           type: string
 *           required: true
 *           description: The phone number of the user.
 *         location:
 *           type: string
 *           required: true
 *           description: The location of the user.
 *         isDeleted:
 *           type: boolean
 *           default: false
 *           description: Indicates if the user is deleted.
 *         isContentCreator:
 *           type: boolean
 *           default: false
 *           description: Indicates if the user is a content creator.
 *         isBlocked:
 *           type: boolean
 *           default: false
 *           description: Indicates if the user is blocked.
 */

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
  const updateQuery = { $set: { "avatar.localPath": imgPath } };

  return UserModel.findOneAndUpdate({ _id: id }, updateQuery, {
    new: true,
  });
};

export const deleteProfilePicture = (id: string) => {
  const updateQuery = { $set: { "avatar.localPath": "" } };

  return UserModel.findOneAndUpdate({ _id: id }, updateQuery, {
    new: true,
  });
};

export const updateUserById = (id: string, values: Record<string, any>) =>
  UserModel.findByIdAndUpdate(id, values, { new: true });
