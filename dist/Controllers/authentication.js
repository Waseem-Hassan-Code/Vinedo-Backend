"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = exports.loginUser = void 0;
const Helpers_1 = require("../Helpers");
const users_1 = require("../Model/users");
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            const response = {
                status: 400,
                message: "Provide email and password!",
                result: {},
            };
            return res.json(response);
        }
        const user = (0, users_1.getUserByEmail)(email).select("+authentication.salt +authentication.password");
        if (!user) {
            const response = {
                status: 400,
                message: "User not found.",
                result: {},
            };
            return res.json(response);
        }
        const expectedHash = (0, Helpers_1.authentication)((await user).authentication.salt, password);
        if ((await user).authentication.password != expectedHash) {
            const response = {
                status: 403,
                message: "Password is incorrect.",
                result: {},
            };
            return res.json(response);
        }
        const salt = (0, Helpers_1.random)();
        (await user).authentication.sessionToken = (0, Helpers_1.authentication)(salt, (await user)._id.toString());
        (await user).save();
        res.cookie("WASEEM-AUTH", (await user).authentication.sessionToken, {
            domain: "localhost",
            path: "/",
        });
        const response = {
            status: 200,
            message: "Password is incorrect.",
            result: user,
        };
        return res.json(response);
    }
    catch (error) {
        console.log(error);
        return res.sendStatus(400);
    }
};
exports.loginUser = loginUser;
const register = async (req, res) => {
    try {
        const { name, userName, password, email, dateOfBirth, whereDoYouLive, whatInspiresYou, whatmakesYouHappy, favouriteQuote, isDeleted, } = req.body;
        if (!name ||
            !userName ||
            !password ||
            !email ||
            !dateOfBirth ||
            !whereDoYouLive ||
            !whatInspiresYou ||
            !whatmakesYouHappy ||
            favouriteQuote ||
            isDeleted) {
            const response = {
                status: 400,
                message: "Provide complete information, fill all the fields!",
                result: {},
            };
            return res.sendStatus(400);
        }
        const existingUser = await (0, users_1.getUserByEmail)(email);
        if (existingUser) {
            const response = {
                status: 400,
                message: "User is already registered!",
                result: {},
            };
            return res.sendStatus(400).json(response);
        }
        const salt = (0, Helpers_1.random)();
        const user = await (0, users_1.createUser)({
            name,
            userName,
            authentication: {
                salt,
                password: (0, Helpers_1.authentication)(salt, password),
            },
            email,
            dateOfBirth,
            whereDoYouLive,
            whatInspiresYou,
            whatmakesYouHappy,
            favouriteQuote,
            isDeleted,
        });
        const response = {
            status: 400,
            message: "User registered successfully!",
            result: user,
        };
        return res.status(200).json(response).end();
    }
    catch (error) {
        console.log(error);
        return res.sendStatus(400);
    }
};
exports.register = register;
//# sourceMappingURL=authentication.js.map