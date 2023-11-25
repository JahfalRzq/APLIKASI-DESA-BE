import { Router } from 'express'
import { checkJwt } from '../../utils/checkJwt'
import {getNews,getNewsById,createNews,updateNews,deleteNews} from '../../controller/NewsController'


const router = Router()
router.get('/get',getNews)
router.get('/get/:id',getNewsById)
router.post('/create',[checkJwt,createNews])
router.post('/update/:id',[checkJwt,updateNews])
router.delete('/delete/:id',[checkJwt,deleteNews])



export default router