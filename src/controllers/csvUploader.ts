import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import { PrismaClient } from '@prisma/client';
import {Request,Response as ExpressResponse} from 'express'

const Prisma=new PrismaClient();
export const uploading = async (
  req: Request & {
    file?: any;
    user?: any;
  },
  res: ExpressResponse
) => {
    try {
        if (!req.file) {
        res.status(400);
        throw new Error("Please upload a file");
        }

        const { id, email, role } = req.user;

        if (role !== "SELLER") {
        throw new Error("Only sellers can upload books");
        }

        const filePath = path.join("uploads", req.file.filename);

        const extension = path.extname(req.file.originalname).toLowerCase();

        if (extension !== ".csv") {
        throw new Error("please upload csv file");
        }

        fs.createReadStream(filePath)
        .pipe(csv())
      .on("data", async (row) => {
        const book = await Prisma.books.create({
          data: {
            title: row.title || "",
            author: row.author || "",
            date: row.publishedDate || "",
            price: row.price || "",
            sid: id
          },
        });
        return book;
      })


        .on("end", async () => {
            fs.unlinkSync(filePath);
            // const seller=await Prisma.sellers.findFirst({
            //     where:{
            //         email
            //     }
            // })
            return res.status(200).json({
            message: "books has been uploaded",
            });
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
}
