"use client";

import dynamic from "next/dynamic";

const BackToTopButton = dynamic(
  () => import("@/app/_components/BackToTopButton"),
  {
    ssr: false,
  },
);

export default BackToTopButton;
