import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

class OpenAIService {
  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async optimizeTitle(originalTitle, category) {
    try {
      const prompt = `Como especialista em SEO e copywriting para o Mercado Livre, optimize o seguinte título de produto para maximizar conversões e visibilidade:
      
Título Original: "${originalTitle}"
Categoria: "${category}"

Considere:
1. Palavras-chave relevantes
2. Limite de caracteres do Mercado Livre
3. Incluir informações importantes como marca, modelo, características principais
4. Ordem das palavras para SEO

Retorne apenas o título otimizado, sem explicações.`;

      const completion = await this.client.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "user", content: prompt }
        ],
      });

      return completion.choices[0].message.content.trim();
    } catch (error) {
      console.error("Erro ao otimizar título:", error);
      throw error;
    }
  }

  async optimizeDescription(originalDescription, title, category) {
    try {
      const prompt = `Como especialista em copywriting para e-commerce, especialmente Mercado Livre, reescreva a seguinte descrição de produto para maximizar conversões:

Título: "${title}"
Categoria: "${category}"
Descrição Original: "${originalDescription}"

Considere:
1. Formato adequado para o Mercado Livre
2. Destaque dos principais benefícios
3. Especificações técnicas importantes
4. Palavras-chave para SEO
5. Chamadas para ação (CTAs)
6. Garantias e diferenciais
7. Formatação com bullets points quando apropriado

Retorne a descrição formatada e otimizada.`;

      const completion = await this.client.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "user", content: prompt }
        ],
      });

      return completion.choices[0].message.content.trim();
    } catch (error) {
      console.error("Erro ao otimizar descrição:", error);
      throw error;
    }
  }

  async analyzeListing(title, description) {
    try {
      const prompt = `Como especialista em vendas no Mercado Livre, analise o seguinte anúncio e forneça sugestões de melhorias:

Título: "${title}"
Descrição: "${description}"

Forneça uma análise detalhada considerando:
1. SEO e visibilidade
2. Persuasão e copywriting
3. Clareza e formatação
4. Pontos fortes
5. Pontos a melhorar

Formato da resposta:
{
  "seoScore": número de 0 a 100,
  "conversionScore": número de 0 a 100,
  "strengths": ["ponto forte 1", "ponto forte 2"],
  "weaknesses": ["ponto fraco 1", "ponto fraco 2"],
  "suggestions": ["sugestão 1", "sugestão 2"]
}`;

      const completion = await this.client.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "user", content: prompt }
        ],
      });

      return JSON.parse(completion.choices[0].message.content);
    } catch (error) {
      console.error("Erro ao analisar anúncio:", error);
      throw error;
    }
  }
}

export default OpenAIService; 