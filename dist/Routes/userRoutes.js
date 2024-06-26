"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userControllers_1 = require("../controllers/userControllers");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
router.route('/register')
    .post(userControllers_1.userRegister);
router.route('/login')
    .post(userControllers_1.userLogin);
router.route('/seeBooks')
    .get(authMiddleware_1.authMiddleware, userControllers_1.seeBooks);
router.route('/seeBooks/:bookId')
    .get(authMiddleware_1.authMiddleware, userControllers_1.seeBookDetails);
module.exports = router;
