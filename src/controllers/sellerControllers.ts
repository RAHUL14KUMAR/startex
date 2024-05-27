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

// here a unique seller can register to the system
export const sellerRegister=async(req:Request,res:ExpressResponse)=>{
    try{
        const { email, password, name } = req.body;
        if(!email ||!password ||!name) {
            res.status(400).json({ message: "Please provide all fields" });
            return;
        }

        const uniqueEmail=await Prisma.sellers.findFirst({
            where:{
                email
            }
        })
        if(uniqueEmail){
            res.status(400).json({message:"sellers with this email already exists"})
            return;
        }

        const isUser=await Prisma.users.findFirst({
            where:{
                email
            }
        })
        if(isUser){
            res.status(400).json({message:"users with this email already exists"})
            return;
        }
        const hashPassword = await bcrypt.hash(password, 10);
        const user = await Prisma.sellers.create({
            data: {
                email,
                sellerpassword: hashPassword,
                name
            },
        });
        res.status(200).json(user);

    }catch(error){
        console.log(error)
        res.status(500).json({message:"something went wrong while registering the sellers"})
    }
}

export const sellerLogin=async(req:Request,res:ExpressResponse)=>{
    try{
        const { email, password } = req.body;
        if(!email ||!password) {
            res.status(400).json({ message: "Please provide all fields" });
            return;
        }
        const seller=await Prisma.sellers.findFirst({
            where:{
                email
            },
            include:{
                books:true
            }
        })
        if(!seller){
            res.status(400).json({message:"seller with this email does not exist"})
            return;
        }
        const isMatch=seller.sellerpassword && await bcrypt.compare(password,seller.sellerpassword)
        if(!isMatch){
            res.status(400).json({message:"password does not match"})
            return;
        }
        const token=seller.email&&generateJwt(seller.email.toString())
        res.status(200).json({
            token,
            seller
        })
    }catch(error){
        console.log(error)
        res.status(500).json({message:"something went wrong while logging in the seller"})
    }
}


// seller can view their own books
export const sellerOwnBook=async(
    req:Request & {user?:{role:string,id:string}},
    res:ExpressResponse)=>{
    try{
        const {role,id}=req.user || {};

        if(role!=='SELLER'){
            res.status(400).json({message:"you are not authorized to perform this action"})
            return;
        }
        const seller=await Prisma.sellers.findFirst({
            where:{
                id:Number(id)
            }
        })

        const books=await Prisma.books.findMany({
            where:{
                sid:seller?.id
            }
        })

        if(books.length===0){
            res.status(200).json({message:"no books has been uploaded by this seller"})
            return;
        }else{
            res.status(200).json(books)
        }

    }catch(error){
        console.log(error)
        res.status(500).json({message:"something went wrong while seller fetching their own books"})
    }
}


// seller can delete its own book
export const sellerDeleteBook=async(
    req:Request & {user?:{role:string,id:string}},
    res:ExpressResponse)=>{
    try{
        const {role,id}=req.user || {};
        if(role!=='SELLER'){
            res.status(400).json({message:"you are not authorized to perform this action"})
            return;
        }

        const {bookId}=req.params;
        if(!bookId){
            res.status(400).json({message:"please provide the correct book id"})
            return;
        }

        const books=await Prisma.books.findFirst({
            where:{
                id:Number(bookId),
                sid:Number(id)
            }
        })

        if(books){
            await Prisma.books.delete({
                where:{
                    id:Number(bookId),
                    sid:Number(id)
                }
            })
            res.status(200).json({message:"book has been deleted successfully"})
            return;
        }else{
            res.status(400).json({message:"book does not exist or you are not the seller of this book"})
        }
    }catch(error){
        console.log(error)
        res.status(500).json({message:"something went wrong while seller deleting their own book"})
    }
}


// seller can update their own book

export const sellerUpdateBook = async (
  req: Request & { user?: { role: string; id: string } },
  res: ExpressResponse
) => {
  try {
    const { role, id } = req.user || {};
    if (role !== "SELLER") {
      res
        .status(400)
        .json({ message: "you are not authorized to perform this action" });
      return;
    }

    const { bookId } = req.params;

    const books = await Prisma.books.findFirst({
      where: {
        id: Number(bookId),
        sid: Number(id),
      },
    });

    if (!books) {
        res.status(400).json({
            message: "book does not exist or you are not the seller of this book"});
        return;
    } else {
        const { title, author, date, price } = req.body;
        if (!title || !author || !price || !date) {
            res.status(400).json({ message: "please provide all the fields" });
            return;
        }
        const updatedBook = await Prisma.books.update({
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
        res.status(200).json({message:"Book has been updated"})
    }
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({
        message: "something went wrong while seller updating their own book",
      });
  }
};
