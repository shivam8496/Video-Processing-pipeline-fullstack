import express from 'express';
import {uploadVideo , getMyVideos , streamVideo } from '../Controllers/videoController.js';
import {protect, authorization } from '../Middleware/userMiddleware.js';
import { upload } from '../Middleware/uploadMiddleware.js'


const router = express.Router();

router.post('/upload',protect,authorization('Editor','Admin'),upload.single('video'),uploadVideo);

router.get('/',protect,getMyVideos);

router.get('/stream/:id', streamVideo);

export default router; 