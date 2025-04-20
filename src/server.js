import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import { body } from 'express-validator';
import { register, login, initializeDatabase } from './controllers/auth.controller.js';
import OpenAIService from './services/openai.service.js';
import ImageService from './services/image.service.js';
import dotenv from 'dotenv';
import multer from 'multer';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// Configure multer for image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
        files: 12 // Maximum 12 files
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'));
        }
    }
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve static files from the root public directory
app.use(express.static(path.join(__dirname, '../public')));

// Initialize database
initializeDatabase();

// Validation middleware
const validateRegister = [
    body('name').notEmpty().withMessage('Nome é obrigatório'),
    body('email').isEmail().withMessage('Email inválido'),
    body('password').isLength({ min: 8 }).withMessage('Senha deve ter pelo menos 8 caracteres'),
    body('phone').optional().isMobilePhone().withMessage('Telefone inválido')
];

const validateLogin = [
    body('email').isEmail().withMessage('Email inválido'),
    body('password').notEmpty().withMessage('Senha é obrigatória')
];

// Serve landing page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Login route
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/login.html'));
});

// Register route
app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/register.html'));
});

// Routes
app.post('/api/register', validateRegister, register);
app.post('/api/login', validateLogin, login);

// Initialize services
const openAIService = new OpenAIService();
const imageService = new ImageService();

// Clean up temp files every hour
setInterval(() => {
    imageService.cleanupTempFiles().catch(console.error);
}, 3600000); // 1 hour

// Endpoint para otimização
app.post('/api/optimize', upload.array('images', 12), async (req, res) => {
    try {
        const { title, description, category, marketplace } = req.body;
        const images = req.files ? req.files.map(file => ({
            path: file.path,
            filename: file.filename,
            url: `/uploads/${file.filename}`
        })) : [];

        // Otimizar título
        const optimizedTitle = await openAIService.optimizeTitle(title, category, marketplace);

        // Otimizar descrição
        const optimizedDescription = await openAIService.optimizeDescription(description, optimizedTitle, category, marketplace);

        // Analisar o anúncio otimizado
        const analysis = await openAIService.analyzeListing(optimizedTitle, optimizedDescription, marketplace);

        // Retornar resultados
        res.json({
            optimizedTitle,
            optimizedDescription,
            analysis,
            images: images.map(img => img.url)
        });

    } catch (error) {
        console.error('Erro na otimização:', error);
        res.status(500).json({ 
            error: 'Erro ao processar a otimização',
            details: error.message 
        });
    }
});

// Endpoint para upscale de imagens
app.post('/api/upscale', async (req, res) => {
    try {
        const { imageUrl, scale } = req.body;
        
        if (!imageUrl) {
            throw new Error('URL da imagem é obrigatória');
        }

        const result = await imageService.upscaleImage(imageUrl, scale);
        res.json(result);
    } catch (error) {
        console.error('Erro no upscale da imagem:', error);
        res.status(500).json({
            error: 'Erro ao processar o upscale da imagem',
            details: error.message
        });
    }
});

// Start server
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
}); 