import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

class OpenAIService {
  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async optimizeTitle(originalTitle, category, marketplace) {
    try {
      const marketplaceInfo = this.getMarketplaceInfo(marketplace);
      const prompt = `Como especialista em SEO e copywriting para ${marketplaceInfo.name}, optimize o seguinte título de produto para maximizar conversões e visibilidade:
      
Título Original: "${originalTitle}"
Categoria: "${category}"

Considere:
1. Palavras-chave relevantes
2. Limite de caracteres do ${marketplaceInfo.name} (${marketplaceInfo.titleLimit})
3. Incluir informações importantes como marca, modelo, características principais
4. Ordem das palavras para SEO
5. ${marketplaceInfo.specificTips}

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

  async optimizeDescription(originalDescription, title, category, marketplace) {
    try {
      const marketplaceInfo = this.getMarketplaceInfo(marketplace);
      const prompt = `Como especialista em copywriting para ${marketplaceInfo.name}, reescreva a seguinte descrição de produto para maximizar conversões:

Título: "${title}"
Categoria: "${category}"
Descrição Original: "${originalDescription}"

Considere:
1. Formato adequado para o ${marketplaceInfo.name}
2. Destaque dos principais benefícios
3. Especificações técnicas importantes
4. Palavras-chave para SEO
5. Chamadas para ação (CTAs)
6. Garantias e diferenciais
7. Formatação com bullets points quando apropriado
8. ${marketplaceInfo.specificTips}

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

  async analyzeListing(title, description, marketplace) {
    try {
      const marketplaceInfo = this.getMarketplaceInfo(marketplace);
      const prompt = `Como especialista em vendas no ${marketplaceInfo.name}, analise o seguinte anúncio e forneça sugestões de melhorias:

Título: "${title}"
Descrição: "${description}"

Forneça uma análise detalhada considerando:
1. SEO e visibilidade
2. Persuasão e copywriting
3. Clareza e formatação
4. Pontos fortes
5. Pontos a melhorar
6. ${marketplaceInfo.specificTips}

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

  getMarketplaceInfo(marketplace) {
    const marketplaces = {
      mercadolivre: {
        name: "Mercado Livre",
        titleLimit: "60 caracteres",
        specificTips: "Incluir palavras-chave no início do título, usar termos como 'novo', 'original', 'garantia'"
      },
      shopee: {
        name: "Shopee",
        titleLimit: "100 caracteres",
        specificTips: "Incluir promoções, frete grátis, e usar hashtags relevantes"
      }
    };

    return marketplaces[marketplace] || marketplaces.mercadolivre;
  }
}

export default OpenAIService; 