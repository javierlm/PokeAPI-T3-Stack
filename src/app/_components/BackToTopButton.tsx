"use client";

import { ArrowUp } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { usePathname } from "next/navigation";
import { useScroll } from "@/context/ScrollContext";

const BackToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);
  const pathname = usePathname();
  const { scrollElementRef } = useScroll();

  const scrollToTop = useCallback(() => {
    if (scrollElementRef.current) {
      scrollElementRef.current.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  }, [scrollElementRef]);

  useEffect(() => {
    const target = document.querySelector("h1");
    if (!target || !scrollElementRef.current) {
      setIsVisible(false);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        setIsVisible(!entries[0]?.isIntersecting);
      },
      {
        root: scrollElementRef.current,
        threshold: 0,
      },
    );

    observer.observe(target);

    return () => {
      observer.unobserve(target);
    };
  }, [pathname, scrollElementRef]);

  return (
    <button
      onClick={scrollToTop}
      className={`fixed right-4 bottom-4 z-50 flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-blue-800 text-white shadow-lg transition-all duration-300 hover:bg-blue-700 sm:right-8 sm:bottom-8 ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
      }`}
      aria-label="Back to top"
    >
      <ArrowUp size={24} />
    </button>
  );
};

export default BackToTopButton;
