
import Chatbot from "@/components/Chatbot";
import MatrixRain from "@/components/MatrixRain";
import { useDarkMode } from "@/hooks/useDarkMode";

// Main page showing the chatbot UI.
const Index = () => {
  const { isDarkMode } = useDarkMode();
  
  return (
    <div className={`h-screen w-screen flex flex-col justify-start relative transition-colors duration-300 overflow-hidden ${
      isDarkMode ? "bg-[#161b22]" : "bg-gray-50"
    }`}>
      <MatrixRain />
      <div className="flex flex-col w-full h-full relative z-10 overflow-hidden">
        <Chatbot />
      </div>
    </div>
  );
};

export default Index;
