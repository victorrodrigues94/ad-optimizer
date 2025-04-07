import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import { body } from 'express-validator';
import { register, login, initializeDatabase } from './controllers/auth.controller.js';
import OpenAIService from './services/openai.service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
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

// Routes
app.post('/api/register', validateRegister, register);
app.post('/api/login', validateLogin, login);

// OpenAI service instance
const openAIService = new OpenAIService();

// Endpoint para otimização
app.post('/api/optimize', async (req, res) => {
    try {
        const { title, description, category, marketplace } = req.body;

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
            analysis
        });

    } catch (error) {
        console.error('Erro na otimização:', error);
        res.status(500).json({ 
            error: 'Erro ao processar a otimização',
            details: error.message 
        });
    }
});

// Start server
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
}); 