import express from 'express';
import { userLogin, userRegister,seeBooks, seeBookDetails } from '../controllers/userControllers';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/register')
.post(userRegister);

router.route('/login')
.post(userLogin);

router.route('/seeBooks')
.get(authMiddleware,seeBooks)

router.route('/seeBooks/:bookId')
.get(authMiddleware,seeBookDetails)

module.exports=router;