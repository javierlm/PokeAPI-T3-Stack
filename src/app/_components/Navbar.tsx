"use client";
import { useState, useEffect, useRef } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

export default function Navbar() {
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const { selectedLang, setSelectedLang } = useLanguage();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const langSelectorRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false); // New state for client-side rendering

  useEffect(() => {
    setMounted(true);
    const handleClickOutside = (event: MouseEvent) => {
      if (
        langSelectorRef.current &&
        !langSelectorRef.current.contains(event.target as Node)
      ) {
        setLangMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [theme, resolvedTheme]);

  return (
    <nav className="flex items-center justify-between bg-white px-4 py-2 shadow dark:bg-gray-900">
      <span className="text-lg font-bold text-gray-800 dark:text-gray-100">
        Poketest
      </span>
      <div className="flex items-center gap-4">
        <div className="relative" ref={langSelectorRef}>
          <button
            onClick={() => setLangMenuOpen(!langMenuOpen)}
            className="flex items-center gap-2 rounded p-2 transition-all hover:scale-110 hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Language selector"
          >
            <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">
              {selectedLang}
            </span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-4 w-4 text-gray-600 transition-transform dark:text-gray-300 ${langMenuOpen ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          {langMenuOpen && (
            <div className="absolute right-0 z-10 mt-2 w-28 rounded-md bg-white shadow-lg dark:bg-gray-800">
              <ul className="py-1">
                <li>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setSelectedLang("es");
                      setLangMenuOpen(false);
                    }}
                    className="block px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-blue-500 hover:text-white dark:text-gray-200 dark:hover:bg-blue-500 dark:hover:text-white"
                  >
                    Español
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setSelectedLang("en");
                      setLangMenuOpen(false);
                    }}
                    className="block px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-blue-500 hover:text-white dark:text-gray-200 dark:hover:bg-blue-500 dark:hover:text-white"
                  >
                    English
                  </a>
                </li>
              </ul>
            </div>
          )}
        </div>

        <button
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          className="rounded-full p-2 transition-all hover:scale-110 hover:bg-gray-100 dark:hover:bg-gray-800"
          aria-label="Toggle theme"
        >
          {mounted ? (
            resolvedTheme === "dark" ? (
              <Moon className="h-6 w-6 stroke-white stroke-2" />
            ) : (
              <Sun className="h-6 w-6 text-yellow-500" />
            )
          ) : (
            <div className="h-6 w-6" />
          )}
        </button>
      </div>
    </nav>
  );
}
