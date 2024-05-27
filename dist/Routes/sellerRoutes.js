"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const sellerControllers_1 = require("../controllers/sellerControllers");
const csvUploader_1 = require("../controllers/csvUploader");
const authMiddleware_1 = require("../middleware/authMiddleware");
const multer_1 = __importDefault(require("multer"));
const upload = (0, multer_1.default)({ dest: "uploads/" });
const router = express_1.default.Router();
router.route('/register')
    .post(sellerControllers_1.sellerRegister);
router.route('/login')
    .post(sellerControllers_1.sellerLogin);
router.route('/csv-upload')
    .get(upload.single('file'), authMiddleware_1.authMiddleware, csvUploader_1.uploading);
router.route('/seeOwnBooks')
    .get(authMiddleware_1.authMiddleware, sellerControllers_1.sellerOwnBook);
router.route('/seeOwnBooks/:bookId')
    .delete(authMiddleware_1.authMiddleware, sellerControllers_1.sellerDeleteBook)
    .put(authMiddleware_1.authMiddleware, sellerControllers_1.sellerUpdateBook);
module.exports = router;
