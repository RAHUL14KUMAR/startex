"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Prisma = void 0;
require('dotenv').config();
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const userRoutes = require('./Routes/userRoutes');
const sellerRoutes = require('./Routes/sellerRoutes');
const app = (0, express_1.default)();
app.use(express_1.default.json());
const port = 4005;
exports.Prisma = new client_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        app.use(express_1.default.json());
        app.get("/api", (req, res) => {
            res.status(200).json("hello message");
        });
        app.use('/user', userRoutes);
        app.use('/seller', sellerRoutes);
        app.listen(port, () => {
            console.log(`Server is listening on port ${port}`);
        });
    });
}
main();
