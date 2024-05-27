import express from 'express';
import { sellerDeleteBook, sellerLogin, sellerOwnBook, sellerRegister, sellerUpdateBook } from '../controllers/sellerControllers';
import { uploading } from '../controllers/csvUploader';
import { authMiddleware } from '../middleware/authMiddleware';
import multer from "multer";


const upload = multer({ dest: "uploads/" });

const router = express.Router();

router.route('/register')
.post(sellerRegister)

router.route('/login')
.post(sellerLogin)

router.route('/csv-upload')
.get(upload.single('file'),authMiddleware,uploading)

router.route('/seeOwnBooks')
.get(authMiddleware,sellerOwnBook)

router.route('/seeOwnBooks/:bookId')
.delete(authMiddleware,sellerDeleteBook)
.put(authMiddleware,sellerUpdateBook)


module.exports=router;