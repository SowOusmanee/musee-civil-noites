import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { 
  X, 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  BookOpen, 
  Compass, 
  Headphones, 
  ArrowRight,
  HelpCircle
} from 'lucide-react';

interface VirtualCuratorModalProps {
  onClose: () => void;
  onOpenBooking: () => void;
  onExploreGallery: () => void;
}

interface Message {
  id: string;
  sender: 'curator' | 'user';
  text: string;
  timestamp: string;
}

export const VirtualCuratorModal: React.FC<VirtualCuratorModalProps> = ({
  onClose,
  onOpenBooking,
  onExploreGallery
}) => {
  const { t, isFr } = useLanguage();

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-1',
      sender: 'curator',
      text: isFr 
        ? "Dalal ak jàmm ! Je suis Cheikh, votre guide culturel et curateur virtuel du Musée des Civilisations Noires de Dakar. Que souhaitez-vous découvrir aujourd'hui sur nos collections, l'histoire des civilisations africaines ou la préparation de votre visite ?"
        : "Dalal ak jàmm! I am Cheikh, your cultural guide and virtual curator at the Museum of Black Civilizations in Dakar. What would you like to explore today about our collections, African civilizations history, or planning your visit?",
      timestamp: isFr ? "À l'instant" : "Just now"
    }
  ]);
  const [inputQuestion, setInputQuestion] = useState('');
  const [isThinking, setIsThinking] = useState(false);

  const suggestedQuestions = isFr ? [
    "Pourquoi le bâtiment du MCN a-t-il une forme circulaire ?",
    "Quelle est l'histoire du masque Punu Okuyi ?",
    "Quelle est la vision de Cheikh Anta Diop pour le musée ?",
    "Quels sont les tarifs et horaires d'ouverture ?"
  ] : [
    "Why does the MCN building have a circular architecture?",
    "What is the story behind the Punu Okuyi mask?",
    "What was Cheikh Anta Diop's vision for the museum?",
    "What are the ticket prices and opening hours?"
  ];

  const getCuratorResponse = (query: string): string => {
    const q = query.toLowerCase();

    if (isFr) {
      if (q.includes('circulaire') || q.includes('architecture') || q.includes('forme') || q.includes('bâtiment')) {
        return "L'architecture du Musée des Civilisations Noires à Dakar s'inspire directement des cases rondes traditionnelles de Casamance et de nombreuses architectures vernaculaires d'Afrique de l'Ouest. Ce cercle parfait symbolise l'universalité, l'esprit de rassemblement (l'arbre à palabres) et le cycle continu de la vie.";
      }

      if (q.includes('punu') || q.includes('okuyi') || q.includes('masque')) {
        return "Le masque Punu 'Okuyi', originaire du Gabon et du bassin de la Ngounié, est une pièce majeure de notre 1er étage. Recouvert de kaolin blanc (pemba), il symbolise la sérénité des esprits ancestraux et la beauté féminine idéalisée, traditionnellement dansé sur échasses lors des rituels mémoriels.";
      }

      if (q.includes('cheikh anta diop') || q.includes('senghor') || q.includes('vision') || q.includes('histoire')) {
        return "L'idée du MCN est née lors du premier Festival Mondial des Arts Nègres initié en 1966 par Léopold Sédar Senghor et théorisée par Cheikh Anta Diop. L'ambition était de créer à Dakar un sanctuaire mondial dédié aux contributions scientifiques, artistiques et philosophiques des civilisations noires à l'humanité.";
      }

      if (q.includes('tarif') || q.includes('horaire') || q.includes('prix') || q.includes('billet') || q.includes('heure')) {
        return "Le musée est ouvert du mardi au dimanche de 10h00 à 19h00 (fermé le lundi). Les tarifs sont de 3 000 FCFA pour les résidents et ressortissants CEDEAO, 1 000 FCFA pour les scolaires/étudiants, et 5 000 FCFA pour les visiteurs internationaux. Vous pouvez réserver vos billets coupe-file directement via notre billetterie intégrée !";
      }

      if (q.includes('ife') || q.includes('bronze') || q.includes('métallurgie') || q.includes('métal')) {
        return "Les têtes royales en bronze d'Ife (Nigéria, XIIe-XIVe siècle) exposées au RDC démontrent l'excellence précoce de la fonte à la cire perdue en Afrique de l'Ouest. Le MCN met en lumière comment la métallurgie africaine a façonné des chefs-d'œuvre artistiques et techniques sans équivalent à l'époque.";
      }

      if (q.includes('tombouctou') || q.includes('manuscrit') || q.includes('science')) {
        return "Au 2e étage, notre galerie des Savoirs abrite des parchemins astronomiques et mathématiques de l'Université Sankoré de Tombouctou (XVIe siècle). Ces traités prouvent l'intense vie intellectuelle, cosmologique et scientifique qui florissait au Sahel médiéval.";
      }

      return "C'est une excellente question sur le patrimoine africain. Le MCN abrite plus de 18 000 pièces retraçant le berceau de l'humanité, l'inventivité métallurgique, les grandes cosmogonies, et le dynamisme de l'art contemporain de la diaspora. N'hésitez pas à explorer notre galerie d'œuvres interactives ou à écouter les audio guides dédiés !";
    } else {
      if (q.includes('circular') || q.includes('architecture') || q.includes('shape') || q.includes('building')) {
        return "The architecture of the Museum of Black Civilizations in Dakar is directly inspired by traditional circular huts of Casamance and West African vernacular architecture. This circular design symbolizes universality, dialogue under the palaver tree, and the continuous cycle of life.";
      }

      if (q.includes('punu') || q.includes('okuyi') || q.includes('mask')) {
        return "The Punu 'Okuyi' mask from Gabon and the Ngounié basin is a key masterpiece on our 1st floor. Coated with white kaolin clay (pemba), it represents ancestral serene spirits and idealized feminine elegance, traditionally danced on stilts during funeral and commemorative rituals.";
      }

      if (q.includes('cheikh anta diop') || q.includes('senghor') || q.includes('vision') || q.includes('history')) {
        return "The visionary idea of MCN was born during the first World Festival of Black Arts in 1966 championed by Léopold Sédar Senghor and conceptualized by Cheikh Anta Diop. The goal was to establish in Dakar a worldwide sanctuary celebrating the scientific, artistic, and philosophical contributions of Black civilizations.";
      }

      if (q.includes('price') || q.includes('hour') || q.includes('ticket') || q.includes('cost') || q.includes('time')) {
        return "The museum is open Tuesday through Sunday from 10:00 AM to 7:00 PM (closed on Mondays). Standard entry is 3,000 CFA for ECOWAS residents, 1,000 CFA for students/children, and 5,000 CFA for international visitors. You can book instant priority fast-track tickets online!";
      }

      if (q.includes('ife') || q.includes('bronze') || q.includes('metal')) {
        return "The bronze royal heads of Ife (Nigeria, 12th-14th century) on the Ground Floor showcase the mastery of lost-wax casting in West Africa, demonstrating how ancient African metallurgy produced unprecedented artistic and technological marvels.";
      }

      if (q.includes('timbuktu') || q.includes('tombouctou') || q.includes('manuscript') || q.includes('science')) {
        return "On Floor 2, our Knowledge Gallery houses rare astronomical and mathematical manuscripts from the University of Sankore in Timbuktu (16th century), reflecting the flourishing intellectual and scientific achievements in the medieval Sahel.";
      }

      return "That is a wonderful question about African cultural heritage. MCN preserves over 18,000 works spanning the cradle of humanity, metallurgy innovations, spiritual cosmologies, and contemporary diaspora art. Feel free to explore our interactive gallery and audio guides!";
    }
  };

  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputQuestion;
    if (!text.trim()) return;

    const userMsg: Message = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      text: text,
      timestamp: isFr ? "À l'instant" : "Just now"
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuestion('');
    setIsThinking(true);

    setTimeout(() => {
      const replyText = getCuratorResponse(text);
      const curatorMsg: Message = {
        id: 'msg-' + (Date.now() + 1),
        sender: 'curator',
        text: replyText,
        timestamp: isFr ? "À l'instant" : "Just now"
      };
      setMessages(prev => [...prev, curatorMsg]);
      setIsThinking(false);
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-[#14100E] border border-[#2D241F] rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[650px] max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-[#2D241F] bg-[#1A1310] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#2D241F] border border-[#3D2B22] flex items-center justify-center text-[#D4AF37]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-syne text-base font-bold text-[#F2E8DF] flex items-center gap-2">
                <span>{t('virtualCuratorName')}</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
              </h3>
              <p className="text-[11px] text-[#D4AF37]">
                {t('virtualCuratorDesc')}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full bg-[#14100E] border border-[#2D241F] text-[#8B735B] hover:text-[#F2E8DF] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat Conversation Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-[#0A0A0A]">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.sender === 'curator' && (
                <div className="w-8 h-8 rounded-full bg-[#D4AF37] text-[#0A0A0A] flex items-center justify-center flex-shrink-0 text-xs font-bold font-syne shadow-md">
                  MCN
                </div>
              )}

              <div
                className={`max-w-[80%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-[#9B3922] text-[#F2E8DF] rounded-br-none shadow-md'
                    : 'bg-[#14100E] border border-[#2D241F] text-[#8B735B] rounded-bl-none shadow-md'
                }`}
              >
                <p className={m.sender === 'curator' ? 'text-[#F2E8DF]' : 'text-white'}>{m.text}</p>
                <span className="block text-[10px] text-[#8B735B] text-right mt-1">
                  {m.timestamp}
                </span>
              </div>

              {m.sender === 'user' && (
                <div className="w-8 h-8 rounded-full bg-[#1A1310] border border-[#2D241F] text-[#F2E8DF] flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-[#D4AF37]" />
                </div>
              )}
            </div>
          ))}

          {isThinking && (
            <div className="flex gap-3 justify-start items-center text-xs text-[#D4AF37]">
              <div className="w-8 h-8 rounded-full bg-[#D4AF37] text-[#0A0A0A] flex items-center justify-center text-xs font-bold font-syne">
                MCN
              </div>
              <div className="bg-[#14100E] p-3 rounded-2xl border border-[#2D241F] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          )}
        </div>

        {/* Suggested Questions Pills */}
        <div className="px-5 py-2.5 bg-[#14100E] border-t border-[#2D241F] overflow-x-auto flex gap-2 scrollbar-none">
          {suggestedQuestions.map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSend(q)}
              className="whitespace-nowrap px-3 py-1.5 rounded-full bg-[#1A1310] hover:bg-[#2D241F] border border-[#2D241F] hover:border-[#D4AF37]/50 text-[11px] text-[#8B735B] hover:text-[#F2E8DF] transition-colors cursor-pointer flex items-center gap-1"
            >
              <HelpCircle className="w-3 h-3 text-[#D4AF37]" />
              <span>{q}</span>
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-[#14100E] border-t border-[#2D241F]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputQuestion}
              onChange={(e) => setInputQuestion(e.target.value)}
              placeholder={isFr ? "Posez une question sur le musée, une œuvre ou Dakar..." : "Ask a question about the museum, artworks, or Dakar..."}
              className="flex-1 bg-[#1A1310] border border-[#2D241F] focus:border-[#D4AF37] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-[#F2E8DF] placeholder-[#8B735B] outline-none transition-colors"
            />
            <button
              type="submit"
              className="p-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#E5C158] text-[#0A0A0A] transition-all cursor-pointer shadow-[0_0_10px_rgba(212,175,55,0.3)]"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

