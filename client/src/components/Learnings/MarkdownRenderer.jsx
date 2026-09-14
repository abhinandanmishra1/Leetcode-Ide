import React, { useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { marked } from "marked";
import DOMPurify from "dompurify";
import { LANGUAGES } from "../../constants/languages";

function mapLanguage(langStr = "") {
  const norm = langStr.trim().toLowerCase();
  if (norm.includes("py")) return LANGUAGES.find((l) => l.id === 71) || LANGUAGES[0];
  if (norm.includes("cpp") || norm.includes("c++")) return LANGUAGES.find((l) => l.id === 54) || LANGUAGES[0];
  if (norm.includes("java") && !norm.includes("script")) return LANGUAGES.find((l) => l.id === 62) || LANGUAGES[0];
  if (norm.includes("type") || norm === "ts") return LANGUAGES.find((l) => l.id === 74) || LANGUAGES[0];
  if (norm.includes("js") || norm.includes("javascript")) return LANGUAGES.find((l) => l.id === 63) || LANGUAGES[0];
  if (norm === "c") return LANGUAGES.find((l) => l.id === 50) || LANGUAGES[0];
  return LANGUAGES[0]; // default C++
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export default function MarkdownRenderer({ content = "", className = "" }) {
  const navigate = useNavigate();
  const containerRef = useRef(null);

  const htmlContent = useMemo(() => {
    if (!content) return "";

    const customRenderer = {
      code({ text, lang }) {
        const cleanLang = (lang || "code").trim();
        const encodedCode = encodeURIComponent(text);
        const escaped = escapeHtml(text);

        return `
          <div class="code-block-wrapper my-5 rounded-xl border border-[#333333] bg-[#1a1a1a] overflow-hidden shadow-lg select-text not-prose">
            <div class="flex items-center justify-between px-4 py-2 bg-[#222222] border-b border-[#333333] text-xs">
              <span class="font-mono text-gray-300 font-semibold tracking-wider uppercase text-[11px]">${escapeHtml(cleanLang)}</span>
              <div class="flex items-center space-x-2">
                <button
                  type="button"
                  data-action="copy-code"
                  data-code="${encodedCode}"
                  class="px-2.5 py-1 text-[11px] rounded bg-[#2c2c2c] hover:bg-[#383838] text-gray-300 hover:text-white transition-colors cursor-pointer inline-flex items-center space-x-1"
                >
                  <span>Copy</span>
                </button>
                <button
                  type="button"
                  data-action="run-code"
                  data-code="${encodedCode}"
                  data-lang="${escapeHtml(cleanLang)}"
                  class="px-3 py-1 text-[11px] rounded font-semibold bg-[#2cbb5d]/15 hover:bg-[#2cbb5d]/25 text-[#2cbb5d] border border-[#2cbb5d]/30 transition-all cursor-pointer inline-flex items-center space-x-1 active:scale-95"
                >
                  <span>▶ Run in CodePad</span>
                </button>
              </div>
            </div>
            <pre class="p-4 text-xs sm:text-sm font-mono text-gray-200 overflow-x-auto leading-relaxed bg-[#161616]"><code>${escaped}</code></pre>
          </div>
        `;
      },
      table({ header, rows }) {
        return `
          <div class="overflow-x-auto my-5 rounded-lg border border-[#333333]">
            <table class="min-w-full divide-y divide-[#333333] text-left text-xs sm:text-sm">
              <thead class="bg-[#1f1f1f] text-gray-300 uppercase tracking-wider font-semibold text-[11px]">
                ${header}
              </thead>
              <tbody class="divide-y divide-[#2a2a2a] bg-[#161616] text-gray-300">
                ${rows}
              </tbody>
            </table>
          </div>
        `;
      },
      tablecell({ content: cellContent, header }) {
        const tag = header ? "th" : "td";
        const cls = header
          ? "px-4 py-2.5 text-xs font-semibold text-gray-200"
          : "px-4 py-2 text-xs sm:text-sm text-gray-300";
        return `<${tag} class="${cls}">${cellContent}</${tag}>`;
      },
      blockquote({ text }) {
        return `
          <blockquote class="my-4 border-l-4 border-[#ffa116] bg-[#ffa116]/10 px-4 py-2.5 rounded-r-lg text-xs sm:text-sm text-gray-300 italic">
            ${text}
          </blockquote>
        `;
      },
      heading({ text, depth }) {
        const sizes = {
          1: "text-2xl sm:text-3xl font-extrabold text-white mt-8 mb-4 border-b border-[#2d2d2d] pb-2",
          2: "text-xl sm:text-2xl font-bold text-gray-100 mt-6 mb-3",
          3: "text-lg sm:text-xl font-semibold text-[#ffa116] mt-5 mb-2",
          4: "text-base sm:text-lg font-semibold text-gray-200 mt-4 mb-2",
          5: "text-sm sm:text-base font-medium text-gray-300 mt-3 mb-1",
          6: "text-xs sm:text-sm font-medium text-gray-400 mt-2 mb-1",
        };
        const cls = sizes[depth] || sizes[2];
        return `<h${depth} class="${cls}">${text}</h${depth}>`;
      },
      link({ href, title, text }) {
        const titleAttr = title ? ` title="${escapeHtml(title)}"` : "";
        return `<a href="${escapeHtml(href)}"${titleAttr} target="_blank" rel="noopener noreferrer" class="text-[#00b4d8] hover:text-[#90e0ef] underline underline-offset-2 transition-colors">${text}</a>`;
      },
      codespan({ text }) {
        return `<code class="px-1.5 py-0.5 rounded bg-[#2a2a2a] text-[#ffa116] font-mono text-xs">${text}</code>`;
      },
      list({ ordered, items }) {
        const tag = ordered ? "ol" : "ul";
        const cls = ordered
          ? "list-decimal list-inside my-3 space-y-1.5 pl-2 text-xs sm:text-sm text-gray-300 leading-relaxed"
          : "list-disc list-inside my-3 space-y-1.5 pl-2 text-xs sm:text-sm text-gray-300 leading-relaxed";
        return `<${tag} class="${cls}">${items}</${tag}>`;
      },
      listitem({ text }) {
        return `<li class="leading-relaxed">${text}</li>`;
      },
      paragraph({ text }) {
        return `<p class="my-3 text-xs sm:text-sm leading-relaxed text-gray-300">${text}</p>`;
      },
      hr() {
        return `<hr class="my-6 border-[#333333]" />`;
      },
    };

    marked.use({
      gfm: true,
      breaks: true,
      renderer: customRenderer,
    });

    const raw = marked.parse(content);
    return DOMPurify.sanitize(raw, {
      ADD_TAGS: ["table", "thead", "tbody", "tr", "th", "td", "button", "span", "pre", "code"],
      ADD_ATTR: ["data-action", "data-code", "data-lang", "target", "rel", "class", "type"],
    });
  }, [content]);

  const handleClick = (e) => {
    // Copy Code button handler
    const copyBtn = e.target.closest('[data-action="copy-code"]');
    if (copyBtn) {
      e.preventDefault();
      const codeStr = decodeURIComponent(copyBtn.getAttribute("data-code") || "");
      if (codeStr) {
        navigator.clipboard.writeText(codeStr);
        const originalHtml = copyBtn.innerHTML;
        copyBtn.innerHTML = "<span class='text-[#2cbb5d] font-semibold'>✓ Copied</span>";
        setTimeout(() => {
          copyBtn.innerHTML = originalHtml;
        }, 1800);
      }
      return;
    }

    // Run in CodePad button handler
    const runBtn = e.target.closest('[data-action="run-code"]');
    if (runBtn) {
      e.preventDefault();
      const codeStr = decodeURIComponent(runBtn.getAttribute("data-code") || "");
      const langStr = runBtn.getAttribute("data-lang") || "";
      const targetLang = mapLanguage(langStr);

      navigate("/ide", {
        state: {
          initialCode: codeStr,
          languageId: targetLang.id,
        },
      });
    }
  };

  return (
    <div
      ref={containerRef}
      onClick={handleClick}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
      className={`markdown-body text-gray-200 leading-relaxed ${className}`}
    />
  );
}
