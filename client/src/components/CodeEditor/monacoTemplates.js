/**
 * Registers slash command completion provider in Monaco Editor
 * Enables commands like /trie, /dsu, /segtree to autocomplete and expand snippets at cursor.
 */
let providerDisposable = null;

export const registerMonacoTemplates = (monaco, getAllTemplatesFn) => {
  // Dispose existing provider if re-registering
  if (providerDisposable) {
    providerDisposable.dispose();
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

      const templates = getAllTemplatesFn ? getAllTemplatesFn() : [];

      const suggestions = templates.map((t) => ({
        label: t.command, // e.g. "/trie"
        kind: monaco.languages.CompletionItemKind.Snippet,
        insertText: t.code,
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        detail: `[Template] ${t.name}`,
        documentation: {
          value: `**${t.name}**\n\n${t.description || "Slash command code template"}\n\n\`\`\`\n${t.code.slice(0, 250)}...\n\`\`\``,
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
