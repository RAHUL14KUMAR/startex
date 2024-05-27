require('dotenv').config();
import express, { Request, Response as ExpressResponse } from 'express';
import {PrismaClient} from '@prisma/client';

const userRoutes=require('./Routes/userRoutes')
const sellerRoutes =require('./Routes/sellerRoutes');

const app=express();
app.use(express.json());

const port=4005;

export const Prisma=new PrismaClient();

async function main() {
    app.use(express.json());

  
    app.get("/api", (req: Request, res: ExpressResponse) => {
      res.status(200).json("hello message") ;
    });

    app.use('/user',userRoutes);
    app.use('/seller',sellerRoutes);
  
    app.listen(port, () => {
      console.log(`Server is listening on port ${port}`);
    });
  }
  
main()

