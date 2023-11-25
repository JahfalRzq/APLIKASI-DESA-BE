import { Request, Response } from "express";
import Joi from "joi";
import { AppDataSource } from "../data-source";
import { User } from "../model/User";
import { joiPasswordExtendCore } from "joi-password";
const joiPassword = Joi.extend(joiPasswordExtendCore)


const { successResponse, errorResponse, validationResponse } = require('../utils/response')


const userRepository = AppDataSource.getRepository(User)


export const userSeeder = async (req: Request, res: Response) => {
    const user = [
        {username : "Admin", email :"admin@gmail.com",password : "Admin123!"},
    ];
    try{
        for (const data of user){
            const newUser = new User()
            newUser.username = data.username
            newUser.email = data.email
            newUser.password = data.password
            newUser.hashPassword()
            await userRepository.save(newUser)
        }
        console.log("User seeded successfully.");

    }catch(error){
        return res.status(400).send(errorResponse(error,400))
    }
}