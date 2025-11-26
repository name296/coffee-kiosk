// ============================================================================
// React 애플리케이션 진입점
// ============================================================================

import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";

// body를 직접 root로 사용
const root = ReactDOM.createRoot(document.body);
root.render(<App />);