"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const body_parser_1 = __importDefault(require("body-parser"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const compression_1 = __importDefault(require("compression"));
const cors_1 = __importDefault(require("cors"));
const mongoose_1 = __importDefault(require("mongoose"));
const Router_1 = __importDefault(require("./Router"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    credentials: true,
}));
app.use((0, compression_1.default)());
app.use((0, cookie_parser_1.default)());
app.use(body_parser_1.default.json());
const server = http_1.default.createServer(app);
server.listen(8080, () => {
    console.log(`Server running on http://localhost:8080/`);
});
const MONGO_URL = "mongodb://127.0.0.1:27017";
mongoose_1.default.Promise = Promise;
mongoose_1.default.connect(MONGO_URL).then(() => {
    console.log("Connection with DB established successfully!");
});
mongoose_1.default.connection.on("error", (error) => console.log(error));
app.use("/", (0, Router_1.default)());
//# sourceMappingURL=index.js.map