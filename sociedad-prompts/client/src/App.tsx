import { useState, useEffect, useMemo } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "./lib/queryClient";
import { 
  Lightbulb, 
  Sparkles, 
  Eraser, 
  CheckCircle, 
  Copy, 
  AlertTriangle,
  Loader2,
  Share2,
  RefreshCw
} from "lucide-react";

// Welcome Animation Component
function WelcomeAnimation({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 3500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 bg-fixed-image animate-fade-in">
      {/* Background overlay */}
      <div className="fixed inset-0 bg-black/35 z-0" />
      
      {/* Welcome content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen">
        <div className="animate-slide-in text-center">
          <img 
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRgY-p5xoNTLSSYVuAkQVN0VV5tUQrGp-Lx-Q&usqp=CAU" 
            alt="Sociedad Prompt's Profile"
            className="w-24 h-24 rounded-full border-4 border-yellow-500 shadow-lg mx-auto mb-4"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'https://placehold.co/96x96/333/FFF?text=🔱';
            }}
          />
          <h2 className="text-2xl font-bold text-white mb-2">
            <span className="welcome-emoji-shadow">🔱</span> <span className="rasta-gradient welcome-text-shadow">Sociedad Prompt's</span> <span className="welcome-emoji-shadow">🔱</span>
          </h2>
          <p className="text-slate-300 text-lg">A carregar as vibrações...</p>
        </div>
      </div>
    </div>
  );
}

// Animated Smoke Component
function AnimatedParticles() {
  return (
    <div className="particles">
      <div className="smoke smoke-1"></div>
      <div className="smoke smoke-2"></div>
      <div className="smoke smoke-3"></div>
      <div className="smoke smoke-4"></div>
      <div className="smoke smoke-5"></div>
      <div className="smoke smoke-6"></div>
    </div>
  );
}

// Progress Bar Component
function ProgressBar({ isVisible }: { isVisible: boolean }) {
  if (!isVisible) return null;
  
  return (
    <div className="progress-bar mb-4">
      <div className="progress-fill"></div>
    </div>
  );
}

// Inspiration Button Component
function InspirationButton({ inspiration, onClick }: { inspiration: string; onClick: () => void }) {
  return (
    <button
      className="h-auto p-4 bg-slate-800/40 text-slate-200 text-left rounded-md w-full inspiration-hover"
      onClick={onClick}
    >
      <p className="text-sm leading-relaxed whitespace-normal">{inspiration}</p>
    </button>
  );
}

export default function App() {
  const [showWelcome, setShowWelcome] = useState(true);
  const [userInput, setUserInput] = useState("");
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [error, setError] = useState("");
  const [copyMessage, setCopyMessage] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const inspirations = [
    "Um leão rasta com dreadlocks dourados meditando numa praia jamaicana ao pôr do sol, fumo suave no ar, arte digital hiper-realista",
    "Jardim sagrado de Jah com plantas exóticas bioluminescentes, rio cristalino e montanhas cobertas por névoa mística",
    "Sound system de madeira tropical na natureza, pessoas dançando reggae sob céu estrelado, vibes positivas",
    "Retrato majestoso de Haile Selassie I com olhar sereno, símbolos rastafáris e bandeira etíope, estilo pintura a óleo clássica",
    "Cabana rústica de madeira em floresta tropical exuberante, rede na varanda, sons de tambores nyabinghi distantes",
    "Astronauta flutuando no cosmos com nebulosas vibrantes, capacete refletindo galáxias infinitas, fotorrealismo espacial",
    "Metrópole cyberpunk com arranha-céus neon rosa e azul, carros voadores, hologramas dançando nas ruas chuva",
    "Sereia encantada com cabelos de algas cantando para golfinhos, gruta submarina iluminada por corais fluorescentes",
    "Dragão oriental majestoso feito de nuvens douradas voando sobre montanha sagrada com cerejeiras em flor",
    "Guerreiro samurai robótico com katana de luz plasma, campo de bambú sob lua cheia, pétalas sakura flutuando",
    "Fénix renascendo de chamas arco-íris no crepúsculo, penas transformando-se em estrelas cadentes brilhantes",
    "Floresta encantada com árvores de rostos sábios, cogumelos gigantes luminosos, fadas etéreas dançando",
    "Cidade atlântida subaquática com cúpulas cristalinas, peixes exóticos nadando entre edifícios, jardins de coral",
    "Templo maia dourado no topo de pirâmide, jaguares místicos guardiões, auroras tropicais no céu noturno",
    "DJ alienígena de três braços em nave translúcida orbitando Saturno, console holográfico, música cósmica",
    "Tartaruga colossal com metrópole no casco navegando oceano estelar, luzes da cidade refletindo no cosmos",
    "Valquíria viking com armadura ornamentada cavalgando lobo gigante através de tempestade de neve ártica",
    "Biblioteca infinita com livros voadores, escadas flutuantes, gato persa sábio lendo pergaminhos antigos",
    "Portal interdimensional em floresta mágica, criaturas fantásticas emergindo, luzes sobrenaturais dançando",
    "Cidade steampunk flutuante nas nuvens, dirigíveis a vapor, engrenagens gigantes, estética vitoriana futurista",
    "Oásis no deserto com palmeiras cristalinas, camelos holográficos, miragem de cidade dourada no horizonte",
    "Submarino vintage explorando abismo oceânico, criaturas bioluminescentes gigantes, ruínas de civilização perdida"
  ];

  const randomInspirations = useMemo(() => {
    const shuffled = [...inspirations].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3);
  }, [refreshKey]);

  const generatePromptMutation = useMutation({
    mutationFn: async (description: string) => {
      const response = await apiRequest("POST", "/api/generate-prompt", { description });
      return response.json();
    },
    onSuccess: (data) => {
      setGeneratedPrompt(data.prompt);
      setError("");
    },
    onError: (error: any) => {
      console.error('Generate prompt error:', error);
      setError(error.message || "Erro ao gerar prompt. Tente novamente.");
    },
  });

  const handleGenerate = () => {
    if (!userInput.trim()) {
      setError("Por favor, descreva a sua ideia antes de gerar o prompt.");
      return;
    }
    
    setError("");
    generatePromptMutation.mutate(userInput.trim());
  };

  const handleClear = () => {
    setUserInput("");
    setGeneratedPrompt("");
    setError("");
  };

  const handleRefreshInspirations = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleShare = async () => {
    if (!generatedPrompt) return;
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Prompt Gerado - Sociedad Prompt\'s',
          text: generatedPrompt,
        });
      } else {
        await navigator.clipboard.writeText(generatedPrompt);
        setCopyMessage("Prompt copiado para partilhar!");
        setTimeout(() => setCopyMessage(""), 3000);
      }
    } catch (error) {
      console.error('Erro ao partilhar:', error);
      // Fallback to copy
      try {
        await navigator.clipboard.writeText(generatedPrompt);
        setCopyMessage("Prompt copiado!");
        setTimeout(() => setCopyMessage(""), 3000);
      } catch (clipboardError) {
        setCopyMessage("Erro ao copiar.");
        setTimeout(() => setCopyMessage(""), 3000);
      }
    }
  };

  const handleCopy = async () => {
    if (!generatedPrompt) return;
    
    try {
      await navigator.clipboard.writeText(generatedPrompt);
      setCopyMessage("Prompt Copiado!");
      setTimeout(() => setCopyMessage(""), 3000);
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = generatedPrompt;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      
      setCopyMessage("Prompt Copiado!");
      setTimeout(() => setCopyMessage(""), 3000);
    }
  };

  const handleInspirationClick = (inspiration: string) => {
    setUserInput(inspiration);
    setError("");
  };

  if (showWelcome) {
    return <WelcomeAnimation onComplete={() => setShowWelcome(false)} />;
  }

  return (
    <div className="min-h-screen bg-fixed-image bg-parallax custom-cursor">
      {/* Background overlay */}
      <div className="fixed inset-0 bg-black/35 z-0" />
      
      {/* Main content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4 animate-fade-in">
        <div className="w-full max-w-4xl bg-slate-900/50 backdrop-blur-sm rounded-xl shadow-2xl border-2 border-yellow-500/25 p-6 md:p-8">
          
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-5xl font-black mb-6 tracking-wide whitespace-nowrap pulse-title">
              <span className="emoji-shadow">🔱</span> <span className="text-3d">SOCIEDAD PROMPT'S</span> <span className="emoji-shadow">🔱</span>
            </h1>
            <p className="text-slate-300 text-lg font-medium mb-2">
              Descreva a sua visão e criaremos um prompt poderoso para a Meta AI!
            </p>
            <p className="text-slate-400 text-sm">
              Inspire-se, crie e transforme as suas ideias em prompts optimizados
            </p>
          </div>

          {/* Input Section */}
          <div className="mb-8">
            <label className="flex items-center text-slate-200 font-medium mb-3">
              <Lightbulb className="w-5 h-5 mr-2 text-yellow-400" />
              Descreva a sua ideia para a imagem:
            </label>
            <textarea
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              rows={4}
              className="w-full bg-slate-800/70 border border-slate-600 text-white placeholder-slate-400 focus:border-yellow-500 focus:ring-yellow-500/20 rounded-md p-3 resize-none"
              placeholder="Ex: Um leão de Judá com dreads e óculos escuros, a tocar guitarra num palco de reggae..."
            />
          </div>

          {/* Progress Bar */}
          <ProgressBar isVisible={generatePromptMutation.isPending} />

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mb-10">
            <button
              onClick={handleGenerate}
              disabled={!userInput.trim() || generatePromptMutation.isPending}
              className="flex-1 rasta-bg-gradient text-black font-bold hover:shadow-xl transition-all duration-200 px-8 py-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center hover:scale-105 active:scale-95 text-lg"
            >
              {generatePromptMutation.isPending ? (
                <Loader2 className="w-6 h-6 mr-3 animate-spin" />
              ) : (
                <Sparkles className="w-6 h-6 mr-3" />
              )}
              {generatePromptMutation.isPending ? "A criar magia..." : "✨ Gerar Prompt Mágico"}
            </button>
            <button
              onClick={handleClear}
              className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-4 rounded-lg transition-all duration-200 flex items-center justify-center hover:scale-105 active:scale-95"
            >
              <Eraser className="w-5 h-5 mr-2" />
              Limpar
            </button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 bg-red-900/50 border border-red-500/50 text-red-200 p-4 rounded-md flex items-center">
              <AlertTriangle className="h-4 w-4 mr-2" />
              <span>{error}</span>
            </div>
          )}

          {/* Copy Message Display */}
          {copyMessage && (
            <div className="mb-6 bg-green-900/50 border border-green-500/50 text-green-200 p-4 rounded-md flex items-center">
              <CheckCircle className="h-4 w-4 mr-2" />
              <span>{copyMessage}</span>
            </div>
          )}

          {/* Dynamic Content Section - Shows Generated Prompt or Inspirations */}
          <div className="mb-10">
            {generatedPrompt ? (
              <div className="animate-fade-in">
                <div className="flex items-center text-slate-200 font-bold mb-4">
                  <CheckCircle className="w-6 h-6 mr-3 text-green-400" />
                  <span className="text-xl">🎯 Prompt Optimizado Criado!</span>
                </div>
                <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-2 border-green-500/30 rounded-xl shadow-2xl">
                  <div className="p-6">
                    <div className="text-white whitespace-pre-wrap mb-6 text-lg leading-relaxed bg-slate-900/50 p-4 rounded-lg border border-slate-600/50">
                      {generatedPrompt}
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={handleCopy}
                        className="flex-1 bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-lg transition-all duration-200 flex items-center justify-center hover:scale-105 active:scale-95 font-semibold"
                      >
                        <Copy className="w-5 h-5 mr-2" />
                        📋 Copiar Prompt
                      </button>
                      <button
                        onClick={handleShare}
                        className="flex-1 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg transition-all duration-200 flex items-center justify-center hover:scale-105 active:scale-95 font-semibold"
                      >
                        <Share2 className="w-5 h-5 mr-2" />
                        🚀 Partilhar
                      </button>
                    </div>
                    <p className="text-slate-400 text-sm text-center mt-4">
                      Agora pode usar este prompt na Meta AI para gerar a sua imagem!
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="animate-fade-in">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-slate-200 mb-1">
                      💡 Inspirações Criativas
                    </h3>
                    <p className="text-slate-400 text-sm">Clique numa inspiração para preencher automaticamente</p>
                  </div>
                  <button
                    onClick={handleRefreshInspirations}
                    className="bg-yellow-600 hover:bg-yellow-500 text-black px-4 py-2 rounded-lg transition-all duration-200 flex items-center hover:scale-105 active:scale-95 font-medium"
                    title="Renovar inspirações"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Renovar
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  {randomInspirations.map((inspiration, index) => (
                    <InspirationButton
                      key={`${refreshKey}-${index}`}
                      inspiration={inspiration}
                      onClick={() => handleInspirationClick(inspiration)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="text-center text-slate-400 text-sm">
            © {new Date().getFullYear()} 🔱 Sociedad Prompt's 🔱. A potencializar a sua criatividade com IA.
          </div>
        </div>
      </div>
    </div>
  );
}
