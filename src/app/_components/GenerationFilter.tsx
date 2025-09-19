import {} from "react";
import { api } from "@/trpc/react";
import { useLanguage } from "@/context/LanguageContext";

interface GenerationFilterProps {
  isOpen: boolean;
  onToggle: () => void;
  selectedGenerations: string[];
  onGenerationChange: (generations: string[]) => void;
}

export function GenerationFilter({
  isOpen,
  onToggle,
  selectedGenerations,
  onGenerationChange,
}: GenerationFilterProps) {
  const { selectedLang } = useLanguage();
  const { data: generationsData } = api.pokemon.getPokemonGenerations.useQuery({
    language: selectedLang,
  });

  const handleSelect = (genName: string) => {
    let newSelectedGenerations: string[];
    if (selectedGenerations.includes(genName)) {
      newSelectedGenerations = selectedGenerations.filter((g) => g !== genName);
    } else {
      newSelectedGenerations = [...selectedGenerations, genName];
    }
    onGenerationChange(newSelectedGenerations);
  };

  const handleSelectAll = () => {
    onGenerationChange([]);
  };

  const getButtonText = () => {
    if (selectedGenerations.length === 0) {
      return "Generación";
    } else if (selectedGenerations.length === 1) {
      const selectedGen = generationsData?.find(
        (gen) => gen.originalName === selectedGenerations[0],
      );
      return selectedGen ? selectedGen.translatedName : "Generación";
    } else {
      return `${selectedGenerations.length} Generaciones`;
    }
  };

  return (
    <div className="relative inline-block text-left">
      <div>
        <button
          type="button"
          className="inline-flex min-w-[120px] justify-center rounded-full border-2 border-gray-300 bg-white px-4 py-3 text-base font-medium text-gray-600 shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none"
          onClick={onToggle}
        >
          {getButtonText()}
          <svg
            className="-mr-1 ml-2 h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      {isOpen && (
        <div className="ring-opacity-5 absolute right-0 z-10 mt-2 max-h-60 w-48 origin-top-right overflow-y-auto rounded-md bg-white shadow-lg ring-1 ring-black focus:outline-none">
          <div
            className="flex flex-col items-center py-1"
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="options-menu"
          >
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handleSelectAll();
              }}
              className="block px-2 py-2 hover:bg-gray-100"
              role="menuitem"
            >
              <span className="rounded-full border border-white/30 bg-gray-200 px-2 py-1 text-xs font-bold text-gray-800 shadow">
                Todas
              </span>
            </a>
            {generationsData?.map((gen) => (
              <a
                key={gen.originalName}
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handleSelect(gen.originalName);
                }}
                className={`block px-2 py-2 hover:bg-gray-100 ${selectedGenerations.includes(gen.originalName) ? "bg-blue-100" : ""}`}
                role="menuitem"
              >
                <span
                  className={`rounded-full border border-white/30 px-2 py-1 text-xs font-bold shadow ${selectedGenerations.includes(gen.originalName) ? "bg-blue-500 text-white" : "bg-blue-200 text-blue-800"}`}
                >
                  {gen.translatedName}
                </span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
