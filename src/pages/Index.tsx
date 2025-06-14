
import Chatbot from "@/components/Chatbot";

// Main page showing the chatbot UI.
const Index = () => {
  return (
    <div className="min-h-screen bg-[#161b22] flex flex-col justify-start">
      <div className="flex flex-col w-full max-w-none mx-0">
        <Chatbot />
      </div>
    </div>
  );
};

export default Index;
