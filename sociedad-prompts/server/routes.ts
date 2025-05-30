import type { Express } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";

const generatePromptSchema = z.object({
  description: z.string()
    .min(1, "Description is required")
    .max(500, "Description too long")
    .trim(),
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Generate optimized prompt using Gemini AI
  app.post("/api/generate-prompt", async (req, res) => {
    try {
      const { description } = generatePromptSchema.parse(req.body);
      
      // Get API key from environment
      const apiKey = process.env.GEMINI_API_KEY || "";
      
      if (!apiKey) {
        return res.status(500).json({ 
          error: "API key not configured. Please set GEMINI_API_KEY environment variable." 
        });
      }

      const systemPrompt = `Você é um especialista em criar prompts para a IA de geração de imagem da Meta no WhatsApp. O utilizador fornecerá uma descrição em linguagem natural da imagem que deseja. Analise-a, extraia os elementos chave: tema, objetos, ambiente, personagens, cores, iluminação e estilo artístico. Com base na sua análise, crie um comando de prompt conciso, criativo, detalhado e otimizado para a Meta AI no WhatsApp, em português. O resultado deve ser APENAS o prompt final, como uma única string de comando, começando com "Gerar imagem:" ou similar, sem introduções, explicações ou qualquer outro texto. Seja vívido, específico e inspirador no prompt que criar. Pense em como a Meta AI interpretaria melhor o comando. Descrição do utilizador: "${description}"`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: systemPrompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topP: 0.9,
            topK: 40,
            maxOutputTokens: 150,
          }
        })
      });

      if (!response.ok) {
        console.error('Gemini API error:', response.status, response.statusText);
        
        if (response.status === 401) {
          return res.status(500).json({ 
            error: "Chave API inválida. Verifique a configuração da API Gemini." 
          });
        } else if (response.status === 429) {
          return res.status(500).json({ 
            error: "Limite de requisições excedido. Tente novamente em alguns minutos." 
          });
        } else {
          return res.status(500).json({ 
            error: "Erro ao comunicar com a API Gemini. Verifique a sua ligação à internet." 
          });
        }
      }

      const data = await response.json();
      
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        return res.status(500).json({ 
          error: "Resposta inválida da API Gemini. Tente novamente." 
        });
      }

      let prompt = data.candidates[0].content.parts[0].text.trim();
      
      // Ensure prompt starts with appropriate prefix
      if (!prompt.toLowerCase().startsWith('gerar imagem:') && 
          !prompt.toLowerCase().startsWith('crie uma imagem:') && 
          !prompt.toLowerCase().startsWith('imagine:')) {
        prompt = 'Gerar imagem: ' + prompt;
      }

      res.json({ prompt });
    } catch (error) {
      console.error('Error generating prompt:', error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: "Dados inválidos fornecidos.",
          details: error.errors 
        });
      }
      
      res.status(500).json({ 
        error: "Erro interno do servidor. Tente novamente." 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
