"use client";

import { ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";

const BackToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => {
    const mainScroll = document.getElementById("main-scroll");
    if (mainScroll && mainScroll.scrollTop > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  const scrollToTop = () => {
    const mainScroll = document.getElementById("main-scroll");
    if (mainScroll) {
      mainScroll.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    const mainScroll = document.getElementById("main-scroll");
    if (mainScroll) {
      mainScroll.addEventListener("scroll", toggleVisibility);
    }
    return () => {
      if (mainScroll) {
        mainScroll.removeEventListener("scroll", toggleVisibility);
      }
    };
  }, []);

  return (
    <button
      onClick={scrollToTop}
      className={`fixed right-4 bottom-4 z-50 flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-blue-800 text-white shadow-lg transition-opacity hover:bg-blue-700 sm:right-8 sm:bottom-8 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      aria-label="Back to top"
    >
      <ArrowUp size={24} />
    </button>
  );
};

export default BackToTopButton;
