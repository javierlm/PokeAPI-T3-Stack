import React from "react";
import styles from "./PokeballLoader.module.css";

const PokeballLoader = () => {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className={styles.pokeball}></div>
    </div>
  );
};

export default PokeballLoader;
