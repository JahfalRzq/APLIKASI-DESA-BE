import { Router } from 'express'
import { checkJwt } from '../../utils/checkJwt'
import {getUsers,getUserById,createUser,updateUser,deleteUser} from '../../controller/StaffManagementController'


export const router = Router()

router.get('/get',[checkJwt,getUsers])
router.get('/get/:id',[checkJwt,getUserById])
router.post('/create',[checkJwt,createUser])
router.put('/update/:id',[checkJwt,updateUser])
router.delete('/delete/:id',[checkJwt,deleteUser])

export default router
