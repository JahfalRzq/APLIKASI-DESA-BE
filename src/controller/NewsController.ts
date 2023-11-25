import { Request, Response } from 'express';
import Joi, { string } from "joi";
import { AppDataSource } from '../data-source';
import fs from 'fs'; // Import modul fs
import  sharp from 'sharp'; // Import sharp library
import { User } from '../model/User';
import { News } from '../model/News';
import isBase64 from 'is-base64';



const{successResponse,errorResponse,validationResponse} = require('../utils/response')
const newsRepository = AppDataSource.getRepository(News)
const userRepository = AppDataSource.getRepository(User)




export const updateNews = async (req: Request, res: Response) => {
    const updateNewsSchema = (input) => Joi.object({
        image: Joi.string().required(),
        title: Joi.string().optional(),
        description: Joi.string().optional(),
        news_type: Joi.string().optional(),
    }).validate(input);

    try {
        const body = req.body;
        const schema = updateNewsSchema(req.body);
        const id = req.params.id;

        const user = await userRepository.findOneBy({ id: req.jwtPayload.id });

        if (!user) {
            return res.status(400).send(successResponse('Add Event is Not Authorized', { data: user }));
        }

        let updateNews;
        const imageName = `Dukcapil-image-${req.params.id}.jpeg`

         if(body.image|| body.title || body.description){
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
                .toFile(`./public/assets/images/news/${imageName}`);
  
        }else{
            // Input gambar bukan base64, abaikan

            }


        updateNews = await newsRepository.findOneBy({ id });

        if (!updateNews) {
            return res.status(404).send({ message: ' News Not Found' });
        }

        updateNews.title = body.title;
        updateNews.image = `public/assets/images/news/${imageName}`;
        updateNews.description = body.description;
        updateNews.news_type = body.news_type;
        updateNews.date = body.date;
        await newsRepository.save(updateNews);
    } else {
        updateNews = await newsRepository.findOneBy({ id });
        console.log('Invalid base64 image format');

    }

     

        res.status(200).json({
            data: updateNews
        });

    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
}



export const getNews = async (req: Request, res: Response) => {

    try {

        const {limit: queryLimit, page: page,title} = req.query
     

        const queryBuilder = newsRepository.createQueryBuilder('news')
        .orderBy('news.createdAt', 'DESC')
    

   
        if (title){
            queryBuilder.where('news.title LIKE :title', {
                title: `%${title}%`
            })
    
        }
    
    const dynamicLimit = queryLimit ? parseInt(queryLimit as string) : null;
    const currentPage = page ? parseInt(page as string) : 1; // Convert page to number, default to 1
    const skip = (currentPage - 1) * (dynamicLimit || 0);

    const [data, totalCount] = await queryBuilder
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


export const getNewsById = async (req: Request, res: Response) => {
    try {
    

        const newsId = req.params.id
        const response = await newsRepository.find({
            where: {
                id: newsId,
            },            
        });
        console.log(response)

        const news = response[0]
        const imagePath = news.image;

        // Baca gambar dari file path
        // fs.readFile(imagePath, (err, data) => {
        //     if (err) {
        //         console.log(err);
        //         return res.status(500).json({ msg: 'Error reading image file' });
        //     }

        //     const base64Image = Buffer.from(data).toString('base64');

        //     news.image = base64Image;

        //     res.status(200).json(response);
        // })
        
        res.status(200).json(response);



    } catch (error) {
        console.log(error)
        res.status(500).json({ msg: error.message })
    }
}





export const createNews = async (req: Request, res: Response) => {
    const createNewsSchema = (input) => Joi.object({
        image: Joi.string().required(),
        title: Joi.string().optional(),
        description: Joi.string().optional(),
        news_type: Joi.string().optional(),
        date: Joi.date().optional(),
    }).validate(input)

    try {
        const body = req.body
        const schema = createNewsSchema(req.body)

        if ('error' in schema) {
            return res.status(422).send(validationResponse(schema))
        }

        const user = await userRepository.findOneBy({ id: req.jwtPayload.id })

        if (!user) {
            return res.status(200).send(successResponse('Add Event is Not Authorized', { data: user }))
        }


        const newNews = new News()
        newNews.title = body.title
        newNews.description = body.description
        newNews.date = body.date
        newNews.image = ''

        await newsRepository.save(newNews)

        if (body.image && typeof body.image === 'string' && body.image.trim() !== '') {
            let parts = body.image.split(';');
            let imageData = parts[1].split(',')[1];
            const img = Buffer.from(imageData, 'base64');
  
            // Validate image size
            const imageSizeInBytes = Buffer.byteLength(imageData);
            const imageSizeInMB = imageSizeInBytes / (1024 * 1024); // Convert bytes to MB
  
        
  
            const imageName = `Dukcapil-image-${newNews.id}.jpeg`;
  
            await sharp(img)
                .toFormat('jpeg', { mozjpeg: true })
                .jpeg({ quality: 100 })
                .toFile(`public/assets/images/news/${imageName}`);
  
            newNews.image = `public/assets/images/news/${imageName}`;
            await newsRepository.save(newNews);
        }

        res.status(201).json({
            data: newNews
        })
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
}


export const deleteNews = async (req: Request, res: Response) => {
    try {
        const id = req.params.id

        const user = await userRepository.findOneBy({ id: req.jwtPayload.id })

        if (!user) {
            return res.status(200).send(successResponse('Add Event is Not Authorized', { data: user }))
        }

        const news = await newsRepository.findOne({ 
            where: {
                id: id
            }
         })

         if (!news) {
            return res.status(404).send({ message: 'News Not Found' })
         }

        const deletednews = await newsRepository.remove(news)
        
        return res.status(200).json({
            message: 'News deleted successfully',
        });
}catch(error){
    res.status(500).json({ msg: error.message });
}
}






