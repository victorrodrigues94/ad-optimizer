import OpenAIService from './services/openai.service.js';

async function testOptimizer() {
  const openAIService = new OpenAIService();

  // Exemplo de produto
  const originalTitle = "Fone de ouvido bluetooth preto";
  const category = "Eletrônicos > Áudio > Fones de Ouvido";
  const originalDescription = "Fone de ouvido bluetooth com bateria de longa duração. Cor preta. Som estéreo. Conexão sem fio.";

  try {
    console.log("=== Teste do Otimizador de Anúncios ===\n");

    // Otimizar título
    console.log("Título Original:", originalTitle);
    const optimizedTitle = await openAIService.optimizeTitle(originalTitle, category);
    console.log("Título Otimizado:", optimizedTitle);
    console.log("\n---\n");

    // Otimizar descrição
    console.log("Descrição Original:", originalDescription);
    const optimizedDescription = await openAIService.optimizeDescription(originalDescription, optimizedTitle, category);
    console.log("Descrição Otimizada:", optimizedDescription);
    console.log("\n---\n");

    // Análise completa
    console.log("Análise do Anúncio:");
    const analysis = await openAIService.analyzeListing(optimizedTitle, optimizedDescription);
    console.log(JSON.stringify(analysis, null, 2));

  } catch (error) {
    console.error("Erro durante o teste:", error);
  }
}

testOptimizer(); 