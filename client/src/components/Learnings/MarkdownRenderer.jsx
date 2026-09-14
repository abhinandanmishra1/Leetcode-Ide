import React, { useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Marked } from "marked";
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

const markedInstance = new Marked({
  gfm: true,
  breaks: true,
  renderer: {
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
    table(token) {
      let headerHtml = "";
      for (let i = 0; i < token.header.length; i++) {
        headerHtml += this.tablecell(token.header[i]);
      }
      headerHtml = `<tr class="border-b border-[#333333]">${headerHtml}</tr>`;

      let rowsHtml = "";
      for (let i = 0; i < token.rows.length; i++) {
        let rowHtml = "";
        for (let j = 0; j < token.rows[i].length; j++) {
          rowHtml += this.tablecell(token.rows[i][j]);
        }
        rowsHtml += `<tr class="border-b border-[#262626] hover:bg-[#222222]/50 transition-colors">${rowHtml}</tr>`;
      }

      return `
        <div class="overflow-x-auto my-5 rounded-lg border border-[#333333]">
          <table class="min-w-full divide-y divide-[#333333] text-left text-xs sm:text-sm">
            <thead class="bg-[#1f1f1f] text-gray-300 uppercase tracking-wider font-semibold text-[11px]">
              ${headerHtml}
            </thead>
            <tbody class="divide-y divide-[#2a2a2a] bg-[#161616] text-gray-300">
              ${rowsHtml}
            </tbody>
          </table>
        </div>
      `;
    },
    tablecell(token) {
      const tag = token.header ? "th" : "td";
      const align = token.align ? ` align="${token.align}"` : "";
      const cls = token.header
        ? "px-4 py-2.5 text-xs font-semibold text-gray-200"
        : "px-4 py-2 text-xs sm:text-sm text-gray-300";
      const content = this.parser.parseInline(token.tokens);
      return `<${tag}${align} class="${cls}">${content}</${tag}>`;
    },
    blockquote(token) {
      const content = this.parser.parse(token.tokens);
      return `
        <blockquote class="my-4 border-l-4 border-[#ffa116] bg-[#ffa116]/10 px-4 py-2.5 rounded-r-lg text-xs sm:text-sm text-gray-300 italic">
          ${content}
        </blockquote>
      `;
    },
    heading(token) {
      const depth = token.depth;
      const text = this.parser.parseInline(token.tokens);
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
    link(token) {
      const href = token.href || "#";
      const titleAttr = token.title ? ` title="${escapeHtml(token.title)}"` : "";
      const text = this.parser.parseInline(token.tokens);
      return `<a href="${escapeHtml(href)}"${titleAttr} target="_blank" rel="noopener noreferrer" class="text-[#00b4d8] hover:text-[#90e0ef] underline underline-offset-2 transition-colors">${text}</a>`;
    },
    codespan(token) {
      return `<code class="px-1.5 py-0.5 rounded bg-[#2a2a2a] text-[#ffa116] font-mono text-xs">${escapeHtml(token.text)}</code>`;
    },
    checkbox({ checked }) {
      const chk = checked ? 'checked="" ' : "";
      return `<input ${chk}disabled="" type="checkbox" class="accent-[#ffa116] mr-1.5 mt-0.5 rounded cursor-default shrink-0" />`;
    },
    list(token) {
      let body = "";
      for (let i = 0; i < token.items.length; i++) {
        body += this.listitem(token.items[i]);
      }
      const tag = token.ordered ? "ol" : "ul";
      const start = token.ordered && token.start !== 1 ? ` start="${token.start}"` : "";
      const cls = token.ordered
        ? "list-decimal list-inside my-3 space-y-1.5 pl-2 text-xs sm:text-sm text-gray-300 leading-relaxed"
        : "list-disc list-inside my-3 space-y-1.5 pl-2 text-xs sm:text-sm text-gray-300 leading-relaxed";
      return `<${tag}${start} class="${cls}">${body}</${tag}>`;
    },
    listitem(item) {
      let content = this.parser.parse(item.tokens);
      if (!item.loose && content.startsWith("<p>") && content.endsWith("</p>\n")) {
        content = content.slice(3, -5);
      } else if (!item.loose && content.startsWith("<p>") && content.endsWith("</p>")) {
        content = content.slice(3, -4);
      }
      const cls = item.task
        ? "leading-relaxed list-none -ml-4 my-1 flex items-start space-x-2"
        : "leading-relaxed my-0.5";
      return `<li class="${cls}">${content}</li>`;
    },
    paragraph(token) {
      const content = this.parser.parseInline(token.tokens);
      return `<p class="my-3 text-xs sm:text-sm leading-relaxed text-gray-300">${content}</p>`;
    },
    hr() {
      return `<hr class="my-6 border-[#333333]" />`;
    },
  },
});

export default function MarkdownRenderer({ content = "", className = "" }) {
  const navigate = useNavigate();
  const containerRef = useRef(null);

  const htmlContent = useMemo(() => {
    if (!content) return "";
    const raw = markedInstance.parse(content);
    return DOMPurify.sanitize(raw, {
      ADD_TAGS: ["table", "thead", "tbody", "tr", "th", "td", "button", "span", "pre", "code", "input"],
      ADD_ATTR: ["data-action", "data-code", "data-lang", "target", "rel", "class", "type", "disabled", "checked"],
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
