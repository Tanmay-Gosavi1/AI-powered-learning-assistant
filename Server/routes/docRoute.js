import express from 'express';
import {uploadDoc , getDocs , getDoc , deleteDoc} from '../controllers/docController.js';
import  protect  from '../middlewares/auth.js';
import upload from '../config/multer.js'

const router = express.Router();

router.use(protect);

router.post('/upload', upload.single('document'), uploadDoc);
router.get('/', getDocs);
router.get('/:id', getDoc);
router.delete('/:id', deleteDoc);

export default router;