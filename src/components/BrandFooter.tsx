
import React from "react";
import { useDarkMode } from "@/hooks/useDarkMode";

const BrandFooter = () => {
  const { isDarkMode } = useDarkMode();
  
  return (
    <footer className="pt-2 pb-4 text-center w-full">
      <span className={`text-sm transition-colors duration-300 ${
        isDarkMode ? "text-blue-400" : "text-blue-600"
      }`}>
        Powered By: <a 
          href="https://www.kwenamai.co.za" 
          target="_blank" 
          rel="noopener noreferrer"
          className={`hover:underline transition-colors duration-300 ${
            isDarkMode ? "hover:text-blue-300" : "hover:text-blue-800"
          }`}
        >
          Kwena Moloto A.I Solutions
        </a>
      </span>
    </footer>
  );
};

export default BrandFooter;
