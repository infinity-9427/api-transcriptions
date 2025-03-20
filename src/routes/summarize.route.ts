import express from 'express';
import { summarizeController } from '../controllers/summarize.controller';
import { verifyToken } from '../controllers/login.controller';

const routerSummarize = express.Router();
routerSummarize.post('/', verifyToken,summarizeController);
// routerSummarize.post('/', verifyToken, upload.single('transcription'), summarizeController);

export default routerSummarize;