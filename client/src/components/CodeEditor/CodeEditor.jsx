import React from "react";
import Editor from "@monaco-editor/react";

const CodeEditor = ({ theme, code, setCode, language }) => {
  const languageValue = typeof language === 'string' ? language : (language?.value || "javascript");

  return (
    <div className="flex-1 w-full h-full min-h-[400px] overflow-hidden bg-[#1e1e1e]">
      <Editor
        height="100%"
        width="100%"
        language={languageValue}
        value={code}
        theme={theme || "vs-dark"}
        options={{
          fontSize: 14,
          fontFamily: "'Fira Code', Menlo, Monaco, 'Courier New', monospace",
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 4,
          lineNumbers: "on",
          renderLineHighlight: "all",
          cursorBlinking: "smooth",
          padding: { top: 12, bottom: 12 },
        }}
        onChange={(value) => setCode(value || "")}
      />
    </div>
  );
};

export default CodeEditor;
