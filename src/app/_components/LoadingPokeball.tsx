import React from "react";

export function LoadingPokeball() {
  return (
    <div className="flex flex-col items-center justify-center py-10">
      <div className="pokeball-loader">
        <div className="pokeball-loader-center-line"></div>
        <div className="pokeball-loader-center-circle"></div>
      </div>
      <p className="mt-4 text-lg text-black">Cargando datos...</p>
      <style jsx>{`
        .pokeball-loader {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          border: 3px solid #333;
          position: relative;
          animation: spin 1.2s linear infinite;
          overflow: hidden;
        }
        .pokeball-loader::before,
        .pokeball-loader::after {
          content: "";
          position: absolute;
          left: 0;
          width: 100%;
          height: 50%;
        }
        .pokeball-loader::before {
          top: 0;
          background-color: #ef5350; /* Red */
          border-bottom: 3px solid #333;
        }
        .pokeball-loader::after {
          bottom: 0;
          background-color: white; /* White */
          border-top: 3px solid #333;
        }
        .pokeball-loader-center-line {
          position: absolute;
          top: 50%;
          left: 0;
          width: 100%;
          height: 3px;
          background-color: #333;
          transform: translateY(-50%);
          z-index: 2;
        }
        .pokeball-loader-center-circle {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 15px;
          height: 15px;
          background-color: white;
          border-radius: 50%;
          border: 3px solid #333;
          z-index: 3;
        }
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
