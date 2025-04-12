import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ImageService {
    constructor() {
        this.apiKey = process.env.PIXELCUT_API_KEY;
        this.baseUrl = 'https://api.developer.pixelcut.ai/v1';
        this.tempDir = path.join(__dirname, '../../public/temp');
        
        // Create temp directory if it doesn't exist
        if (!fs.existsSync(this.tempDir)) {
            fs.mkdirSync(this.tempDir, { recursive: true });
        }
    }

    async saveBase64Image(base64Data) {
        try {
            // Remove the data URL prefix if present
            const base64String = base64Data.replace(/^data:image\/\w+;base64,/, '');
            
            // Generate a unique filename
            const filename = `temp_${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
            const filePath = path.join(this.tempDir, filename);
            
            // Write the base64 data to a file
            fs.writeFileSync(filePath, base64String, 'base64');
            
            // Return the URL path
            return `/temp/${filename}`;
        } catch (error) {
            console.error('Erro ao salvar imagem temporária:', error);
            throw error;
        }
    }

    async upscaleImage(imageUrl, scale = 2) {
        try {
            // If the image is a base64 string, save it first
            if (imageUrl.startsWith('data:')) {
                imageUrl = await this.saveBase64Image(imageUrl);
            }

            // Make sure we have a full URL
            if (!imageUrl.startsWith('http')) {
                imageUrl = `http://localhost:${process.env.PORT || 3000}${imageUrl}`;
            }

            const data = JSON.stringify({
                image_url: imageUrl,
                scale: scale
            });

            const config = {
                method: 'post',
                maxBodyLength: Infinity,
                url: `${this.baseUrl}/upscale`,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-API-KEY': this.apiKey
                },
                data: data
            };

            const response = await axios.request(config);
            return response.data;
        } catch (error) {
            console.error('Erro ao fazer upscale da imagem:', error);
            throw error;
        }
    }

    // Clean up temporary files
    async cleanupTempFiles() {
        try {
            const files = fs.readdirSync(this.tempDir);
            const now = Date.now();
            
            for (const file of files) {
                const filePath = path.join(this.tempDir, file);
                const stats = fs.statSync(filePath);
                
                // Delete files older than 1 hour
                if (now - stats.mtimeMs > 3600000) {
                    fs.unlinkSync(filePath);
                }
            }
        } catch (error) {
            console.error('Erro ao limpar arquivos temporários:', error);
        }
    }
}

export default ImageService; 