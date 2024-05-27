import { PrismaClient } from '@prisma/client';
import {Request,Response as ExpressResponse} from 'express'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'


const Prisma=new PrismaClient();

const generateJwt = (id: string) => {
  return jwt.sign({ id }, process.env.SECRET_KEY as jwt.Secret, {
    expiresIn: "30d",
  });
};

// here unique user can register to the system
export const userRegister = async (req: Request, res: ExpressResponse) => {
    try{
        const { email, password, name } = req.body;

        if(!email ||!password ||!name) {
            res.status(400).json({ message: "Please provide all fields" });
            return;
        }
        const uniqueEmail=await Prisma.users.findFirst({
            where:{
                email
            }
        })
        if(uniqueEmail){
            res.status(400).json({message:"users with this email already exists"})
            return;
        }

        const isSeller=await Prisma.sellers.findFirst({
            where:{
                email
            }
        })
        if(isSeller){
            res.status(400).json({message:"Sellers with this email already exists"})
            return;
        }

        const hashPassword = await bcrypt.hash(password, 10);
        const user = await Prisma.users.create({
            data: {
                email,
                userpassword: hashPassword,
                name
            },
        });
        res.status(200).json(user);
    }catch(error){
        console.log(error)
        res.status(500).json({message:"something went wrong while reegistering the users"})
    }
};


// user can login
export const userLogin = async (req: Request, res: ExpressResponse) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ message: "Please provide all fields" });
      return;
    }
    const user = await Prisma.users.findFirst({
      where: {
        email,
      },
    });
    if (!user) {
      res.status(400).json({ message: "user with this email does not exist" });
      return;
    }
    const isMatch =
      user.userpassword && (await bcrypt.compare(password, user.userpassword));
    if (!isMatch) {
      res.status(400).json({ message: "password is incorrect" });
      return;
    }
    const token = user.email&&generateJwt(user.email.toString());
    res.status(200).json({
      token,
      user
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "something went wrong while logging in the users" });
  }
};

// user can see all the books
export const seeBooks = async (
  req: Request & { user?:{role:string} },
  res: ExpressResponse
) => {
  try {
    const {role} = req.user||{};
    if(role==='USER'){
        const books=await Prisma.books.findMany({})
        res.status(200).json(books)
        return;
    }
    res.status(200).json("hello");
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "something went wrong while fetching the books" });
  }
};

// user can see the details of the particular books
export const seeBookDetails = async (
  req: Request & { user?: { role: string } },
  res: ExpressResponse
) => {
  try {
    const { role } = req.user || {};
    if (role === "USER") {
        const { bookId } = req.params;
        if (!bookId) {
            res.status(400).json({ message: `book with ID ${bookId} does not exist` });;
            return;
        }
        const book = await Prisma.books.findFirst({
            where: {
            id: Number(bookId),
            },
        });
        res.status(200).json(book);
        return;
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "something went wrong while fetching the book details",
    });
  }
};
