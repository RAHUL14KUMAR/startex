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
exports.sellerUpdateBook = exports.sellerDeleteBook = exports.sellerOwnBook = exports.sellerLogin = exports.sellerRegister = void 0;
const client_1 = require("@prisma/client");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const Prisma = new client_1.PrismaClient();
const generateJwt = (id) => {
    return jsonwebtoken_1.default.sign({ id }, process.env.SECRET_KEY, {
        expiresIn: "30d",
    });
};
// here a unique seller can register to the system
const sellerRegister = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password, name } = req.body;
        if (!email || !password || !name) {
            res.status(400).json({ message: "Please provide all fields" });
            return;
        }
        const uniqueEmail = yield Prisma.sellers.findFirst({
            where: {
                email
            }
        });
        if (uniqueEmail) {
            res.status(400).json({ message: "sellers with this email already exists" });
            return;
        }
        const isUser = yield Prisma.users.findFirst({
            where: {
                email
            }
        });
        if (isUser) {
            res.status(400).json({ message: "users with this email already exists" });
            return;
        }
        const hashPassword = yield bcryptjs_1.default.hash(password, 10);
        const user = yield Prisma.sellers.create({
            data: {
                email,
                sellerpassword: hashPassword,
                name
            },
        });
        res.status(200).json(user);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "something went wrong while registering the sellers" });
    }
});
exports.sellerRegister = sellerRegister;
const sellerLogin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ message: "Please provide all fields" });
            return;
        }
        const seller = yield Prisma.sellers.findFirst({
            where: {
                email
            },
            include: {
                books: true
            }
        });
        if (!seller) {
            res.status(400).json({ message: "seller with this email does not exist" });
            return;
        }
        const isMatch = seller.sellerpassword && (yield bcryptjs_1.default.compare(password, seller.sellerpassword));
        if (!isMatch) {
            res.status(400).json({ message: "password does not match" });
            return;
        }
        const token = seller.email && generateJwt(seller.email.toString());
        res.status(200).json({
            token,
            seller
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "something went wrong while logging in the seller" });
    }
});
exports.sellerLogin = sellerLogin;
// seller can view their own books
const sellerOwnBook = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { role, id } = req.user || {};
        if (role !== 'SELLER') {
            res.status(400).json({ message: "you are not authorized to perform this action" });
            return;
        }
        const seller = yield Prisma.sellers.findFirst({
            where: {
                id: Number(id)
            }
        });
        const books = yield Prisma.books.findMany({
            where: {
                sid: seller === null || seller === void 0 ? void 0 : seller.id
            }
        });
        if (books.length === 0) {
            res.status(200).json({ message: "no books has been uploaded by this seller" });
            return;
        }
        else {
            res.status(200).json(books);
        }
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "something went wrong while seller fetching their own books" });
    }
});
exports.sellerOwnBook = sellerOwnBook;
// seller can delete its own book
const sellerDeleteBook = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { role, id } = req.user || {};
        if (role !== 'SELLER') {
            res.status(400).json({ message: "you are not authorized to perform this action" });
            return;
        }
        const { bookId } = req.params;
        if (!bookId) {
            res.status(400).json({ message: "please provide the correct book id" });
            return;
        }
        const books = yield Prisma.books.findFirst({
            where: {
                id: Number(bookId),
                sid: Number(id)
            }
        });
        if (books) {
            yield Prisma.books.delete({
                where: {
                    id: Number(bookId),
                    sid: Number(id)
                }
            });
            res.status(200).json({ message: "book has been deleted successfully" });
            return;
        }
        else {
            res.status(400).json({ message: "book does not exist or you are not the seller of this book" });
        }
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "something went wrong while seller deleting their own book" });
    }
});
exports.sellerDeleteBook = sellerDeleteBook;
// seller can update their own book
const sellerUpdateBook = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { role, id } = req.user || {};
        if (role !== "SELLER") {
            res
                .status(400)
                .json({ message: "you are not authorized to perform this action" });
            return;
        }
        const { bookId } = req.params;
        const books = yield Prisma.books.findFirst({
            where: {
                id: Number(bookId),
                sid: Number(id),
            },
        });
        if (!books) {
            res.status(400).json({
                message: "book does not exist or you are not the seller of this book"
            });
            return;
        }
        else {
            const { title, author, date, price } = req.body;
            if (!title || !author || !price || !date) {
                res.status(400).json({ message: "please provide all the fields" });
                return;
            }
            const updatedBook = yield Prisma.books.update({
                where: {
                    id: Number(bookId),
                },
                data: {
                    title,
                    author,
                    date,
                    price,
                },
            });
            res.status(200).json({ message: "Book has been updated" });
        }
    }
    catch (error) {
        console.log(error);
        res
            .status(500)
            .json({
            message: "something went wrong while seller updating their own book",
        });
    }
});
exports.sellerUpdateBook = sellerUpdateBook;
