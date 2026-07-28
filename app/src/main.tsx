import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./styles/research-quest.css";
import "./styles/chat-quest.css";

const root = document.querySelector("#root");

if (!root) {
  throw new Error("Research Quest 挂载节点不存在。");
}

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
