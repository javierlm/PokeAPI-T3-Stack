import { ChevronDown } from "lucide-react";
import { typeColors } from "@/lib/constants";
import { api } from "@/trpc/react";
import { useLanguage } from "@/context/LanguageContext";
import { useTranslations } from "next-intl";

interface TypeFilterProps {
  isOpen: boolean;
  onToggle: () => void;
  selectedTypes: string[];
  onTypeChange: (types: string[]) => void;
}

export function TypeFilter({
  isOpen,
  onToggle,
  selectedTypes,
  onTypeChange,
}: TypeFilterProps) {
  const t = useTranslations("TypeFilter");
  const { locale } = useLanguage();
  const { data: typesData } = api.pokemon.getPokemonTypes.useQuery({
    language: locale,
  });

  const handleSelect = (type: string) => {
    let updatedTypes: string[];
    if (selectedTypes.includes(type)) {
      updatedTypes = selectedTypes.filter((t) => t !== type);
    } else {
      updatedTypes = [...selectedTypes, type];
    }
    onTypeChange(updatedTypes);
  };

  const handleClearAll = () => {
    onTypeChange([]);
    onToggle();
  };

  const displaySelectedTypes =
    selectedTypes.length > 0
      ? selectedTypes
          .map((type) => {
            const typeInfo = typesData?.find((t) => t.originalName === type);
            return typeInfo ? typeInfo.translatedName : type;
          })
          .join(", ")
      : t("type");

  return (
    <div className="relative inline-block text-left">
      <div>
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-full border-2 border-gray-300 bg-white px-4 py-3 text-base font-medium text-gray-600 shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none"
          onClick={onToggle}
        >
          {displaySelectedTypes}
          <ChevronDown
            className={`-mr-1 ml-2 h-5 w-5 transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      {isOpen && (
        <div className="ring-opacity-5 absolute right-0 z-10 mt-2 max-h-60 w-32 origin-top-right overflow-y-auto rounded-md bg-white shadow-lg ring-1 ring-black focus:outline-none">
          <div
            className="flex flex-col items-center py-1"
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="options-menu"
          >
            <button
              onClick={handleClearAll}
              className="block w-full px-2 py-2 text-center hover:bg-gray-100"
              role="menuitem"
            >
              <span className="rounded-full border border-white/30 bg-gray-200 px-2 py-1 text-xs font-bold text-gray-800 shadow">
                {t("clear")}
              </span>
            </button>
            {typesData?.map((type) => {
              const isSelected = selectedTypes.includes(type.originalName);
              const colorClass =
                typeColors[type.originalName.toLowerCase()] ??
                "bg-gray-200 text-gray-800";
              return (
                <button
                  key={type.originalName}
                  onClick={() => handleSelect(type.originalName)}
                  className={`block w-full px-2 py-2 text-center hover:bg-gray-100 ${isSelected ? "bg-blue-50" : ""}`}
                  role="menuitem"
                >
                  <span
                    className={`rounded-full border border-white/30 px-2 py-1 text-xs font-bold shadow ${colorClass}`}
                  >
                    {type.translatedName} {isSelected && "✓"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
