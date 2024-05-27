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
exports.uploading = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const csv_parser_1 = __importDefault(require("csv-parser"));
const client_1 = require("@prisma/client");
const Prisma = new client_1.PrismaClient();
const uploading = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.file) {
            res.status(400);
            throw new Error("Please upload a file");
        }
        const { id, email, role } = req.user;
        if (role !== "SELLER") {
            throw new Error("Only sellers can upload books");
        }
        const filePath = path_1.default.join("uploads", req.file.filename);
        const extension = path_1.default.extname(req.file.originalname).toLowerCase();
        if (extension !== ".csv") {
            throw new Error("please upload csv file");
        }
        fs_1.default.createReadStream(filePath)
            .pipe((0, csv_parser_1.default)())
            .on("data", (row) => __awaiter(void 0, void 0, void 0, function* () {
            const book = yield Prisma.books.create({
                data: {
                    title: row.title || "",
                    author: row.author || "",
                    date: row.publishedDate || "",
                    price: row.price || "",
                    sid: id
                },
            });
            return book;
        }))
            .on("end", () => __awaiter(void 0, void 0, void 0, function* () {
            fs_1.default.unlinkSync(filePath);
            // const seller=await Prisma.sellers.findFirst({
            //     where:{
            //         email
            //     }
            // })
            return res.status(200).json({
                message: "books has been uploaded",
            });
        }));
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.uploading = uploading;
