import { Router } from 'express'
import RouteAuth from './RouteAuth'
import routerNews from './RouteNews'
import routerUser from './RouteUserSeeder'
import routeUser from './RouteUser'





const router = Router()

router.use('/auth', RouteAuth)
router.use('/news', routerNews)
router.use('/users', routerUser)
router.use('/user', routeUser)




export default router

