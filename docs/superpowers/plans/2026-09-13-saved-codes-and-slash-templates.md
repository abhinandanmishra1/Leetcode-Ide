# Saved Codes System & Slash Command Templates Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a comprehensive problem/code saving system with unique `_`-normalized identifiers and a management modal, alongside a Monaco Editor slash-command template system (`/trie`, `/dsu`, `/segtree`, etc.) supporting instant snippet expansion and custom template authoring.

**Architecture:**
- **Problem Storage Engine**: Dedicated `storage.js` service for managing saved problem entities (`{ id, name, languageId, code, testCases, updatedAt }`), enforcing normalization (e.g. `"Two Sum"` $\to$ `"two_sum"`), search indexing, and load/delete operations.
- **Saved Codes Manager UI**:
  - `SaveModal`: Modal prompting for problem name, displaying live normalized ID preview (`_` substitution), duplicate detection, and confirmation.
  - `SavedCodesModal`: Modal drawer listing saved items with search/filter, language tags, testcase counts, timestamps, "Load", "Delete", and "Export".
- **Slash Command Template Engine**:
  - `defaultTemplates.js`: Pre-loaded competitive programming templates (`/trie`, `/dsu`, `/segtree`, `/dijkstra`, `/bfs`, `/dfs`, `/binarysearch`, `/modexp`) for C++, Python, Java, and JS.
  - `monacoTemplates.js`: Monaco `CompletionItemProvider` triggered on `/`, displaying template previews and expanding code directly at cursor position.
  - `TemplatesModal`: UI for browsing built-in templates and adding custom slash shortcuts.
- **Navbar Controls**: Integrated "Save", "Saved Codes", and "Templates" buttons in authentic LeetCode Dark style.

**Tech Stack:** React 18, Vite 5, Monaco Editor (`@monaco-editor/react`), Tailwind CSS, FontAwesome icons, `localStorage`.

---

## User Review Required

> [!IMPORTANT]
> 1. **Normalization Behavior**: When saving a code with name `"Dijkstra Shortest Path"`, the unique identifier will automatically become `"dijkstra_shortest_path"`. If an item with this ID already exists, the modal alerts the user and asks if they wish to overwrite it.
> 2. **Monaco Autocomplete for Templates**:
>    - Typing `/` anywhere in the editor will trigger Monaco's native snippet completion menu with all available slash commands.
>    - Pressing `Tab` or `Enter` immediately expands the template at cursor position and removes the trigger `/command`.
>    - In addition, a "Templates" modal allows inspecting templates, copying them, or inserting them with a single click.

---

## Proposed Changes

### Task 1: Storage Layer for Saved Problems & Custom Templates
- Modify: `client/src/utils/storage.js`

### Task 2: Built-in Competitive Programming Templates & Monaco Completion Provider
- Create: `client/src/components/Templates/defaultTemplates.js`
- Create: `client/src/components/CodeEditor/monacoTemplates.js`

### Task 3: UI Modals (SaveModal, SavedCodesModal, TemplatesModal)
- Create: `client/src/components/SavedCodes/SaveModal.jsx`
- Create: `client/src/components/SavedCodes/SavedCodesModal.jsx`
- Create: `client/src/components/Templates/TemplatesModal.jsx`

### Task 4: Navbar & App Integration
- Modify: `client/src/components/Navbar/Navbar.jsx`
- Modify: `client/src/components/CodeEditor/CodeEditor.jsx`
- Modify: `client/src/App.jsx`

---

## Verification Plan

### Automated Tests
```bash
npm test --prefix server
npm run build --prefix client
```
