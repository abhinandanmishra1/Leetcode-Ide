/**
 * Registers slash command completion provider in Monaco Editor
 * Enables commands like /trie, /dsu, /segtree to autocomplete and expand snippets at cursor.
 */
let providerDisposable = null;
let currentTemplatesGetter = null;

export const registerMonacoTemplates = (monaco, getAllTemplatesFn) => {
  currentTemplatesGetter = getAllTemplatesFn;

  if (providerDisposable) {
    return providerDisposable;
  }

  const supportedLanguages = ["cpp", "python", "java", "javascript", "typescript", "c"];

  providerDisposable = monaco.languages.registerCompletionItemProvider(supportedLanguages, {
    triggerCharacters: ["/"],
    provideCompletionItems: (model, position) => {
      const lineContent = model.getLineContent(position.lineNumber);
      const textUntilPosition = lineContent.substring(0, position.column - 1);

      // Match trailing slash command e.g. "/trie" or "/"
      const match = textUntilPosition.match(/\/[a-zA-Z0-9_]*$/);
      if (!match) {
        return { suggestions: [] };
      }

      const matchText = match[0];
      const startColumn = position.column - matchText.length;

      const templates = currentTemplatesGetter ? currentTemplatesGetter() : [];

      const suggestions = templates.map((t) => ({
        label: t.command, // e.g. "/binarysearch"
        kind: monaco.languages.CompletionItemKind.Snippet,
        insertText: t.code,
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        detail: `[${t.languageName || "Snippet"}] ${t.name}`,
        documentation: {
          value: `**${t.name}** (${t.languageName || "Snippet"})\n\n${t.description || "Slash command code snippet"}\n\n\`\`\`\n${t.code.slice(0, 300)}...\n\`\`\``,
        },
        range: {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: startColumn,
          endColumn: position.column,
        },
      }));

      return { suggestions };
    },
  });

  return providerDisposable;
};

export default registerMonacoTemplates;
