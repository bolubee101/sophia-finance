import { Router } from 'express';
import multer from 'multer';
import { handleUpload, getHistory, handleAsk } from '../controllers/uploadController';

const router = Router();

const upload = multer({ storage: multer.memoryStorage() });

router.post('/', upload.single('statement'), handleUpload);
router.get('/history', getHistory);
router.post('/ask', handleAsk);

export default router;
