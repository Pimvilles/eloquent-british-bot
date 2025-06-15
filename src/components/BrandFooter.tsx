
import React from "react";
import { useDarkMode } from "@/hooks/useDarkMode";

const BrandFooter = () => {
  const { isDarkMode } = useDarkMode();
  
  return (
    <footer className="pt-2 pb-4 text-center w-full">
      <span className={`text-sm transition-colors duration-300 ${
        isDarkMode ? "text-blue-400" : "text-blue-600"
      }`}>
        Powered By: Kwena Moloto A.I Solutions
      </span>
    </footer>
  );
};

export default BrandFooter;
