import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App/App.tsx";

const tempWindow: any = window;

function addEditor(
  node: any,
  textareaName: string,
  content: string,
  imgSrc: string = ""
) {
  ReactDOM.createRoot(node).render(
    <React.StrictMode>
      <main>
        <App textareaName={textareaName} content={content} imgSrc={imgSrc} />
      </main>
    </React.StrictMode>
  );
}

tempWindow["addEditor"] = addEditor;
