import { useEffect, useState } from "react"; // Importação dos hooks useEffect e useState
import { useRouter } from "next/router"; // Importação do hook useRouter para navegação
import { toast } from "react-toastify"; // Biblioteca para notificações
import "react-toastify/dist/ReactToastify.css"; // Estilos do Toastify
import useMessages from "../hooks/useMessages"; // Hook para mensagens traduzidas
import axiosInstance from "../lib/axiosInstance"; // 🚀 Usa axiosInstance para chamadas API

export default function WelcomePage() {
  const messages = useMessages(); // Hook para mensagens traduzidas
  const [sessionData, setSessionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data } = await axiosInstance.get("/api/session", { timeout: 5000 });

        if (!data.valid) {
          throw new Error("Sessão inválida");
        }

        setSessionData(data);
      } catch (error) {
        console.error("Erro na API:", error.message || error);

        let errorMessage = messages.error?.server_error;
        if (error.response) {
          if (error.response.status === 404) {
            errorMessage = messages.error?.session_not_found;
          } else if (error.response.status === 500) {
            errorMessage = messages.error?.server_error;
          }
        } else if (error.code === "ECONNABORTED") {
          errorMessage = messages.error?.server_timeout;
        } else if (error.message.includes("Network Error")) {
          errorMessage = messages.error?.server_unavailable;
        }

        toast.error(errorMessage);
        setTimeout(() => router.push("/auth"), 2000);
      } finally {
        setLoading(false);
        setTimeout(() => setIsLoading(false), 1000);
      }
    };

    checkSession();
  }, []);

  const handleLogout = async () => {
    await axiosInstance.post("/api/logout");
    toast.info(messages.auth?.logout_success);
    router.push("/auth");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-4 relative">
      {isLoading && (
        <div className="absolute inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center z-50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-white mb-4"></div>
          <p className="text-lg font-semibold text-white">A carregar...</p>
        </div>
      )}

      {!isLoading && (
        <>
          {sessionData ? (
            <div className="bg-gray-800 text-gray-300 p-4 rounded-md text-sm w-full max-w-md border border-gray-700 shadow-lg">
              <span className="font-semibold text-blue-400">{messages.welcome?.user_label}</span>
              <pre className="mt-2 break-words whitespace-pre-wrap">{sessionData.user.username}</pre>

              <span className="font-semibold text-blue-400 mt-4 block">Token JWT:</span>
              <pre className="mt-2 break-words whitespace-pre-wrap text-xs bg-gray-700 p-2 rounded">
                {sessionData.token}
              </pre>

              <button
                onClick={handleLogout}
                className="mt-4 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded w-full transition-transform transform hover:scale-105"
              >
                {messages.auth?.logout_button || "Sair"}
              </button>
            </div>
          ) : (
            <p className="text-gray-400">{messages.welcome?.session_expired}</p>
          )}

          {/* Would You Rather Game */}
          <WouldYouRather />
        </>
      )}
    </div>
  );
}

function WouldYouRather() {
  const [question, setQuestion] = useState(null);
  const [percentages, setPercentages] = useState(null);

  const questions = [
    ["Fight 100 duck-sized horses", "Fight 1 horse-sized duck"],
    ["Always be 10 minutes late", "Always be 20 minutes early"],
    ["Have no internet for a month", "Have no snacks for a year"],
    ["Only eat pizza forever", "Never eat pizza again"],
    ["Always have to sing instead of talk 🎤", "Dance instead of walk? 💃"],
    ["Have spaghetti for hair 🍝" ,"Marshmallows for fingers? 🍡"],
    ["Always sneeze glitter ✨", "Always fart confetti? 🎊"],
    ["Be able to speak to animals 🦜","Read minds? 🧠"],
    ["Have a rewind button ⏪"  ,"A pause button ⏸ for your life?"],
    ["Never use a phone again 📵" , "Never watch TV/movies again? 📺"],
    ["Live without music 🎵" , "Live without books? 📖"],
    ["Have no elbows 🚫💪" , "No knees? 🚫🦵"],
    ["Be rich but bored 💰😐" , "Poor but always entertained? 😆"],
    ["Have unlimited ice cream 🍦 but no cake 🎂", "Unlimited cake but no ice cream?"],
    ["Drink only water forever 💧", "Only soda forever? 🥤"],
    ["Fly but only 2 feet off the ground ✈️","Be invisible but only for 10 seconds?"],
    ["Be super strong 💪 but slow 🐢 ", "Super fast ⚡ but weak?"],
    ["Teleport anywhere 🌍 but only once per week" , "Run at 100mph but never stop running?"]
  ];

  const generateQuestion = () => {
    setPercentages(null);
    const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
    setQuestion(randomQuestion);
  };

  const handleChoice = (choiceIndex) => {
    const first = Math.floor(Math.random() * 100);
    const second = 100 - first;
    setPercentages(choiceIndex === 0 ? [first, second] : [second, first]);
  };

  useEffect(() => {
    generateQuestion();
  }, []);

  return (
    <div className="mt-8 bg-gray-800 p-6 rounded-lg shadow-lg max-w-md text-center border border-gray-700">
      <h2 className="text-xl font-bold text-blue-400 mb-4">Would You Rather?</h2>

      {question && (
        <div>
          <button
            onClick={() => handleChoice(0)}
            className="block w-full bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded mt-2 transition-transform transform hover:scale-105"
          >
            {question[0]}
          </button>
          <button
            onClick={() => handleChoice(1)}
            className="block w-full bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded mt-2 transition-transform transform hover:scale-105"
          >
            {question[1]}
          </button>
        </div>
      )}

      {percentages && (
        <div className="mt-4 text-gray-300">
          <p>{percentages[0]}% chose the first option.</p>
          <p>{percentages[1]}% chose the second option.</p>
        </div>
      )}

      <button
        onClick={generateQuestion}
        className="mt-4 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded transition-transform transform hover:scale-105"
      >
        New Question
      </button>
    </div>
  );
}
