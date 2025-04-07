import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import OpenAIService from './services/openai.service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// Middleware para processar JSON
app.use(express.json());

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, '../public')));

// Instanciar o serviço OpenAI
const openAIService = new OpenAIService();

// Endpoint para otimização
app.post('/api/optimize', async (req, res) => {
    try {
        const { title, description, category } = req.body;

        // Otimizar título
        const optimizedTitle = await openAIService.optimizeTitle(title, category);

        // Otimizar descrição
        const optimizedDescription = await openAIService.optimizeDescription(description, optimizedTitle, category);

        // Analisar o anúncio otimizado
        const analysis = await openAIService.analyzeListing(optimizedTitle, optimizedDescription);

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

// Iniciar o servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
}); 