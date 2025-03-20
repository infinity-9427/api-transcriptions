import express from 'express';
import { loginUser } from '../controllers/login.controller';

const routerAuth = express.Router();

routerAuth.post('/', loginUser);

export default routerAuth;