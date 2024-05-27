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
exports.seeBookDetails = exports.seeBooks = exports.userLogin = exports.userRegister = void 0;
const client_1 = require("@prisma/client");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const Prisma = new client_1.PrismaClient();
const generateJwt = (id) => {
    return jsonwebtoken_1.default.sign({ id }, process.env.SECRET_KEY, {
        expiresIn: "30d",
    });
};
// here unique user can register to the system
const userRegister = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password, name } = req.body;
        if (!email || !password || !name) {
            res.status(400).json({ message: "Please provide all fields" });
            return;
        }
        const uniqueEmail = yield Prisma.users.findFirst({
            where: {
                email
            }
        });
        if (uniqueEmail) {
            res.status(400).json({ message: "users with this email already exists" });
            return;
        }
        const isSeller = yield Prisma.sellers.findFirst({
            where: {
                email
            }
        });
        if (isSeller) {
            res.status(400).json({ message: "Sellers with this email already exists" });
            return;
        }
        const hashPassword = yield bcryptjs_1.default.hash(password, 10);
        const user = yield Prisma.users.create({
            data: {
                email,
                userpassword: hashPassword,
                name
            },
        });
        res.status(200).json(user);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "something went wrong while reegistering the users" });
    }
});
exports.userRegister = userRegister;
// user can login
const userLogin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ message: "Please provide all fields" });
            return;
        }
        const user = yield Prisma.users.findFirst({
            where: {
                email,
            },
        });
        if (!user) {
            res.status(400).json({ message: "user with this email does not exist" });
            return;
        }
        const isMatch = user.userpassword && (yield bcryptjs_1.default.compare(password, user.userpassword));
        if (!isMatch) {
            res.status(400).json({ message: "password is incorrect" });
            return;
        }
        const token = user.email && generateJwt(user.email.toString());
        res.status(200).json({
            token,
            user
        });
    }
    catch (error) {
        console.log(error);
        res
            .status(500)
            .json({ message: "something went wrong while logging in the users" });
    }
});
exports.userLogin = userLogin;
// user can see all the books
const seeBooks = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { role } = req.user || {};
        if (role === 'USER') {
            const books = yield Prisma.books.findMany({});
            res.status(200).json(books);
            return;
        }
        res.status(200).json("hello");
    }
    catch (error) {
        console.log(error);
        res
            .status(500)
            .json({ message: "something went wrong while fetching the books" });
    }
});
exports.seeBooks = seeBooks;
// user can see the details of the particular books
const seeBookDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { role } = req.user || {};
        if (role === "USER") {
            const { bookId } = req.params;
            if (!bookId) {
                res.status(400).json({ message: `book with ID ${bookId} does not exist` });
                ;
                return;
            }
            const book = yield Prisma.books.findFirst({
                where: {
                    id: Number(bookId),
                },
            });
            res.status(200).json(book);
            return;
        }
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            message: "something went wrong while fetching the book details",
        });
    }
});
exports.seeBookDetails = seeBookDetails;
