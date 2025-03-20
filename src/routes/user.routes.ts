import express from 'express';
import { createUser, getAllUsers } from '../controllers/user.controller';

const routerUser = express.Router(); 

routerUser.get('/', getAllUsers);
routerUser.post('/', createUser);

export default routerUser;