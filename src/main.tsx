import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import SpellingBeeGame from "./SpellingBeeGame.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <SpellingBeeGame />
  </StrictMode>
);
