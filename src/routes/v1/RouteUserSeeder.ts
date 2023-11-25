import { Router } from 'express'
import { userSeeder } from '../../controller/UserSeeder'

const router = Router()

router.get('/seed', userSeeder)

export default router
