import { Request, Response } from 'express';
import Joi, { string } from "joi";
import { AppDataSource } from '../data-source';
import fs from 'fs'; // Import modul fs
import sharp from "sharp"
import { User } from '../model/User';
const { joiPasswordExtendCore } = require('joi-password')
const joiPassword = Joi.extend(joiPasswordExtendCore)
import isBase64 from 'is-base64';



const{successResponse,errorResponse,validationResponse} = require('../utils/response')


const userRepository = AppDataSource.getRepository(User)


export const getUsers = async (req: Request, res: Response) => {
    try {
        const { fullname,username,page,limit: queryLimit } = req.query;

    
        const queryBuilder = userRepository.createQueryBuilder('user')
        .orderBy('user.createdAt')

        const dynamicLimit = queryLimit ? parseInt(queryLimit as string) : null;
            const currentPage = page ? parseInt(page as string) : 1; // Convert page to number, default to 1
            const skip = (currentPage - 1) * (dynamicLimit || 0);

        if(fullname){
            queryBuilder.andWhere('user.fullname = :fullname', {
                fullname: `${fullname}`
            })
        }

        
        if(username){
            queryBuilder.andWhere('user.username = :username', {
                username: `${username}`
            })
        }


        const [data,totalCount] = await queryBuilder
        .skip(skip)
        .take(dynamicLimit || undefined)
        .getManyAndCount();


        res.status(200).json({
            data,
            totalCount,
            currentPage,
            totalPages: Math.ceil(totalCount / (dynamicLimit || 1)),
        })

}catch(error){
    res.status(500).json({ msg: error.message })
}
}




export const getUserById = async (req: Request, res: Response) => {
    try {
        const id = req.params.id
        const user = await userRepository.findOneBy({ id });

        if (!user) {
            return res.status(500).send(successResponse('User not Found', { data: user }));
        }

        res.status(200).json(user)

}catch(error){
    res.status(500).json({ msg: error.message })
}
}



export const createUser = async (req: Request, res: Response) => {
    try {
        const userSchema = Joi.object({
            username: Joi.string().optional(),
            email: Joi.string().email().optional(),
            password: joiPassword
            .string()
            .minOfSpecialCharacters(1)
            .minOfLowercase(1)
            .minOfUppercase(1)
            .noWhiteSpaces(),
            image: Joi.string().optional(),
        });

        const body = req.body;
        const schema = userSchema.validate(body);


        const existingUser = await userRepository.findOneBy({ email: body.email });

        if (existingUser) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        const user = await userRepository.findOneBy({ id: req.jwtPayload.id })

        if (!user) {
            return res.status(500).send(successResponse('User not Found', { data: user }));
        }


        const newAdmin = new User()
        newAdmin.username = body.username
        newAdmin.email = body.email
        newAdmin.password = body.password
        newAdmin.hashPassword()
        newAdmin.image = ''
        await userRepository.save(newAdmin)

        if (body.image && typeof body.image === 'string' && body.image.trim() !== '') {
            let parts = body.image.split(';');
            let imageData = parts[1].split(',')[1];
            const img = Buffer.from(imageData, 'base64');
  
            // Validate image size
            const imageSizeInBytes = Buffer.byteLength(imageData);
            const imageSizeInMB = imageSizeInBytes / (1024 * 1024); // Convert bytes to MB
  
        
  
            const imageName = `Dukcapil-Staff-image-${newAdmin.id}.jpeg`;
  
            await sharp(img)
                .toFormat('jpeg', { mozjpeg: true })
                .jpeg({ quality: 100 })
                .toFile(`public/assets/images/staff/${imageName}`);
  
            newAdmin.image = `public/assets/images/staff/${imageName}`;
            await userRepository.save(newAdmin);
        }



        res.status(201).json({
            data: newAdmin
        })

}catch(error){
    res.status(500).json({ msg: error.message })
}
}


export const updateUser = async (req: Request, res: Response) => {
    try {
        const userSchema = Joi.object({
            fullname: Joi.string().optional(),
            username: Joi.string().optional(),
            email: Joi.string().email().optional(),
            password: joiPassword
            .string()
            .minOfSpecialCharacters(1)
            .minOfLowercase(1)
            .minOfUppercase(1)
            .noWhiteSpaces(),
            image: Joi.string().optional(),
        });

        const body = req.body;
        const id = req.params.id

        const existingUser = await userRepository.findOneBy({ email: body.email });

        if (existingUser) {
            return res.status(400).json({ message: 'Email already exists' });
        }



        let updateAdmin;
        const imageName = `Dukcapil-staff-image-${req.params.id}.jpeg`

        if(body.image|| body.fullname || body.username || body.email){
            if (body.image && isBase64(body.image, { mimeRequired: true })) {


            let parts = body.image.split(';');
            let imageData = parts[1].split(',')[1];
            const img = Buffer.from(imageData, 'base64');
  
            // Validate image size
            const imageSizeInBytes = Buffer.byteLength(imageData);
            const imageSizeInMB = imageSizeInBytes / (1024 * 1024); // Convert bytes to MB
  
          
            await sharp(img)
                .toFormat('jpeg', { mozjpeg: true })
                .jpeg({ quality: 100 })
                .toFile(`./public/assets/images/staff/${imageName}`);
  
        }else{
            // Input gambar bukan base64, abaikan

            }


        updateAdmin = await userRepository.findOneBy({ id });

        if (!updateAdmin) {
            return res.status(404).send({ message: ' News Not Found' });
        }

        updateAdmin.username = body.username;
        updateAdmin.image = `public/assets/images/staff/${imageName}`;
        updateAdmin.email = body.email;
        updateAdmin.password = body.password;
        updateAdmin.hashPassword()
        await userRepository.save(updateAdmin);
    } else {
        updateAdmin = await userRepository.findOneBy({ id });
        console.log('Invalid base64 image format');

    }

        await userRepository.save(updateAdmin)

        res.status(200).json({
            data: updateAdmin
        })


}catch(error){
    res.status(500).json({ msg: error.message })
}
}


export const deleteUser = async (req: Request, res: Response) => {
    try {
        const id = req.params.id
        const user = await userRepository.findOneBy({ id });

        if (!user) {
            return res.status(500).send(successResponse('User not Found', { data: user }));
        }

        await userRepository.remove(user)
        return res.status(200).json({ message: 'Admin has been deleted' });
    }catch(error){
    res.status(500).json({ msg: error.message })
}
}


