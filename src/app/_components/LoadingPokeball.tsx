import { useTranslations } from "next-intl";
import styles from "./LoadingPokeball.module.css";

export function LoadingPokeball() {
  const t = useTranslations("Loading");
  return (
    <div className="flex flex-col items-center justify-center py-10">
      <div className={styles["pokeball-loader"]}>
        <div className={styles["pokeball-loader-center-line"]}></div>
        <div className={styles["pokeball-loader-center-circle"]}></div>
      </div>
      <p className="text-foreground mt-4 text-lg">{t("loadingData")}</p>
    </div>
  );
}
