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
exports.authMiddleware = void 0;
const client_1 = require("@prisma/client");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const Prisma = new client_1.PrismaClient();
const authMiddleware = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            res.status(401).json({ message: "Authorization header is missing" });
            return;
        }
        const token = authHeader.split(" ")[1];
        const tokenData = jsonwebtoken_1.default.verify(token, process.env.SECRET_KEY);
        const user = yield Prisma.users.findFirst({
            where: {
                email: tokenData.id,
            },
        });
        const seller = yield Prisma.sellers.findFirst({
            where: {
                email: tokenData.id,
            },
        });
        if (user) {
            req.user = user;
            next();
        }
        else if (seller) {
            req.user = seller;
            next();
        }
        else {
            res.status(401).json({ message: "Invalid token" });
        }
    }
    catch (error) {
        res.status(401).json({ message: "Invalid token" });
    }
});
exports.authMiddleware = authMiddleware;
