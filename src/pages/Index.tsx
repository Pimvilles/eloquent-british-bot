
import Chatbot from "@/components/Chatbot";
import MatrixRain from "@/components/MatrixRain";
import { useDarkMode } from "@/hooks/useDarkMode";

// Main page showing the chatbot UI.
const Index = () => {
  const { isDarkMode } = useDarkMode();
  
  return (
    <div className={`min-h-screen flex flex-col justify-start relative transition-colors duration-300 ${
      isDarkMode ? "bg-[#161b22]" : "bg-gray-50"
    }`}>
      <MatrixRain />
      <div className="flex flex-col w-full max-w-none mx-0 relative z-10">
        <Chatbot />
      </div>
    </div>
  );
};

export default Index;
