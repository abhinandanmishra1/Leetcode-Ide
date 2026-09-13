import React, { useState, useRef } from "react";
import Editor from "@monaco-editor/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCode } from "@fortawesome/free-solid-svg-icons";

const CodeEditor = ({ code, setCode, language }) => {
  const languageValue = typeof language === "string" ? language : (language?.value || "cpp");
  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });
  const editorRef = useRef(null);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;

    // Define custom LeetCode dark theme
    monaco.editor.defineTheme("leetcode-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "keyword", foreground: "569cd6", fontStyle: "bold" },
        { token: "type", foreground: "4ec9b0" },
        { token: "string", foreground: "ce9178" },
        { token: "number", foreground: "b5cea8" },
        { token: "comment", foreground: "6a9955", fontStyle: "italic" },
        { token: "identifier", foreground: "9cdcfe" },
        { token: "delimiter", foreground: "d4d4d4" },
      ],
      colors: {
        "editor.background": "#1e1e1e",
        "editor.foreground": "#d4d4d4",
        "editor.lineHighlightBackground": "#282828",
        "editor.selectionBackground": "#264f78",
        "editorCursor.foreground": "#ffffff",
        "editorLineNumber.foreground": "#5a5a5a",
        "editorLineNumber.activeForeground": "#c6c6c6",
        "editorGutter.background": "#1e1e1e",
      },
    });

    monaco.editor.setTheme("leetcode-dark");

    // Track cursor position
    editor.onDidChangeCursorPosition((e) => {
      setCursorPos({
        line: e.position.lineNumber,
        col: e.position.column,
      });
    });
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#1e1e1e] overflow-hidden">
      {/* Code Header Bar */}
      <div className="flex items-center justify-between px-3 bg-[#222222] border-b border-[#333333] h-10 select-none flex-shrink-0">
        <div className="flex items-center space-x-2 text-xs font-semibold text-gray-200">
          <span className="text-[#2cbb5d]">
            <FontAwesomeIcon icon={faCode} />
          </span>
          <span>Code</span>
        </div>
        <div className="text-gray-400 text-xs font-mono">
          {language?.name || "C++"}
        </div>
      </div>

      {/* Editor Body */}
      <div className="flex-1 w-full min-h-0 relative overflow-hidden">
        <Editor
          height="100%"
          width="100%"
          language={languageValue}
          value={code}
          theme="leetcode-dark"
          onMount={handleEditorDidMount}
          options={{
            fontSize: 13,
            fontFamily: "'Fira Code', Menlo, Monaco, Consolas, 'Courier New', monospace",
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 4,
            lineNumbers: "on",
            renderLineHighlight: "all",
            cursorBlinking: "smooth",
            smoothScrolling: true,
            padding: { top: 10, bottom: 10 },
            overviewRulerBorder: false,
            scrollbar: {
              verticalScrollbarSize: 8,
              horizontalScrollbarSize: 8,
            },
          }}
          onChange={(value) => setCode(value || "")}
        />
      </div>

      {/* Editor Footer Status Bar */}
      <div className="flex items-center justify-between px-3 py-1 bg-[#1a1a1a] border-t border-[#2e2e2e] text-[11px] text-gray-400 select-none flex-shrink-0">
        <div className="flex items-center space-x-2">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#2cbb5d]" />
          <span>Saved</span>
        </div>
        <div className="font-mono text-gray-500">
          Ln {cursorPos.line}, Col {cursorPos.col}
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;
