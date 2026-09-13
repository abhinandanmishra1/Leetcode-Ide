import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy, faCheck } from "@fortawesome/free-solid-svg-icons";

export const CopyButton = ({ text, title = "Copy to clipboard" }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e) => {
    e.stopPropagation();
    if (text === undefined || text === null) return;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for non-https/older browsers
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.warn("Failed to copy:", err);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      title={title}
      className={`inline-flex items-center space-x-1 text-xs px-2 py-0.5 rounded transition-all select-none border ${
        copied
          ? "bg-[#2cbb5d]/20 border-[#2cbb5d]/50 text-[#2cbb5d]"
          : "bg-[#333333] hover:bg-[#444444] border-[#444444] text-gray-300 hover:text-white"
      }`}
    >
      <FontAwesomeIcon icon={copied ? faCheck : faCopy} className="text-[10px]" />
      <span className="text-[11px] font-medium">{copied ? "Copied!" : "Copy"}</span>
    </button>
  );
};

export default CopyButton;
