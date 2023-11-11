"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserById = exports.deleteUserById = exports.createUser = exports.getUserById = exports.getUserBySessionToken = exports.getUserByEmail = exports.getUsers = exports.UserModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const UserShema = new mongoose_1.default.Schema({
    name: { type: String, required: true },
    userName: { type: String, require: true },
    authentication: {
        password: { type: String, required: true, select: false },
        salt: { type: String, select: false },
        sessionToken: { type: String, select: false },
    },
    email: { type: String, required: true },
    dateOfBirth: { type: Date, required: true },
    whereDoYouLive: { type: String, required: true },
    whatInspiresYou: { type: String, required: true },
    whatmakesYouHappy: { type: String, required: true },
    favouriteQuote: { type: String, required: true },
    isDeleted: { type: Boolean, select: false },
});
exports.UserModel = mongoose_1.default.model("user", UserShema);
const getUsers = () => exports.UserModel.find();
exports.getUsers = getUsers;
const getUserByEmail = (email) => exports.UserModel.findOne({ email });
exports.getUserByEmail = getUserByEmail;
const getUserBySessionToken = (sessionToken) => exports.UserModel.findOne({ "authentication.sessionToken": sessionToken });
exports.getUserBySessionToken = getUserBySessionToken;
const getUserById = (id) => exports.UserModel.findById(id);
exports.getUserById = getUserById;
const createUser = (values) => new exports.UserModel(values).save().then((user) => user.toObject());
exports.createUser = createUser;
const deleteUserById = (id) => {
    return exports.UserModel.findOneAndUpdate({ _id: id }, { $set: { isDeleted: true } }, { new: true });
};
exports.deleteUserById = deleteUserById;
const updateUserById = (id, values) => exports.UserModel.findByIdAndUpdate(id, values, { new: true });
exports.updateUserById = updateUserById;
//# sourceMappingURL=users.js.map