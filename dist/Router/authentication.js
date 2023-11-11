"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const authentication_1 = require("../Controllers/authentication");
exports.default = (router) => {
    router.post("/auth/register", authentication_1.register);
    router.post("/auth/login", authentication_1.loginUser);
};
//# sourceMappingURL=authentication.js.map