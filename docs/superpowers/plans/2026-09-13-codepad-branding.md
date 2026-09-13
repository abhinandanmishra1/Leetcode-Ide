# CodePad Brand Identity & Asset Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebrand the application to CodePad everywhere by implementing the new vector logo component, generating crisp favicon and PWA assets, updating Navbar and HTML headers, standardizing starter code templates, and gracefully migrating persistent storage keys.

**Architecture:** 
- A dedicated `CodePadLogo.jsx` component that exports the default full 220×220 SVG, an inline horizontal `CodePadBrand` for navigation headers, and an isolated `CodePadIcon`.
- An asset generation script using Node.js and sharp/canvas/pure SVG to generate `client/public/` favicon and PNG assets.
- Integrated Navbar branding and updated HTML metadata.
- Storage utility migration with backward-compatible fallbacks.

**Tech Stack:** React 18, Vite 5, Tailwind CSS, Node.js.

## Global Constraints
- The default export in `src/components/Brand/CodePadLogo.jsx` must match the exact 220×220 SVG structure provided by the user.
- Navbar height is 50px with a dark `#282828` background; branding in the navbar must be visually crisp and readable.
- Favicon and app assets must be placed in `client/public/` so Vite automatically serves them from the root `/`.
- LocalStorage keys must migrate seamlessly without wiping existing user code or preferences.

---

### Task 1: Create CodePad Logo Component

**Files:**
- Create: `client/src/components/Brand/CodePadLogo.jsx`
- Test: `client/src/components/Brand/__tests__/CodePadLogo.test.js`

**Interfaces:**
- Produces:
  - `export default function CodePadLogo({ className, ...props }): JSX.Element`
  - `export function CodePadBrand({ className }): JSX.Element`
  - `export function CodePadIcon({ size = 32, className }): JSX.Element`

- [ ] **Step 1: Write component validation test script**

Create `client/src/components/Brand/__tests__/validateLogo.js`:
```javascript
import React from "react";
import CodePadLogo, { CodePadBrand, CodePadIcon } from "../CodePadLogo.jsx";

// Basic presence and contract verification
if (typeof CodePadLogo !== "function") {
  throw new Error("CodePadLogo must be a function component");
}
if (typeof CodePadBrand !== "function") {
  throw new Error("CodePadBrand must be a function component");
}
if (typeof CodePadIcon !== "function") {
  throw new Error("CodePadIcon must be a function component");
}
console.log("CodePad logo components exported successfully.");
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node -e "import('./src/components/Brand/__tests__/validateLogo.js')"` in `client/`
Expected: FAIL with module not found.

- [ ] **Step 3: Implement `CodePadLogo.jsx`**

Create `client/src/components/Brand/CodePadLogo.jsx` containing:
- `CodePadLogo`: The exact 220×220 SVG component.
- `CodePadIcon`: An SVG viewBox="0 0 160 165" containing the editor frame, orange corner, inner editor, window dots, and syntax brackets `< / >`.
- `CodePadBrand`: Horizontal lockup combining `CodePadIcon` (height 30px) with styled typography (`<span className="text-white font-bold text-lg tracking-tight">Code</span><span className="text-[#FFA116] font-bold text-lg tracking-tight">Pad</span>`) and optional `IDE` badge.

- [ ] **Step 4: Run test to verify it passes**

Run: `node client/src/components/Brand/__tests__/validateLogo.js`
Expected: "CodePad logo components exported successfully."

- [ ] **Step 5: Commit**

```bash
git add client/src/components/Brand/
git commit -m "feat(brand): add CodePadLogo and CodePadBrand components"
```

---

### Task 2: Generate Favicons and App Icons

**Files:**
- Create: `client/scripts/generate-favicons.js`
- Create: `client/public/favicon.svg`
- Create: `client/public/favicon.ico`
- Create: `client/public/apple-touch-icon.png`
- Create: `client/public/logo192.png`
- Create: `client/public/logo512.png`
- Create: `client/public/manifest.json`

**Interfaces:**
- Produces: Static web assets in `client/public/` ready for consumption by `index.html` and browsers.

- [ ] **Step 1: Write asset generation script**

Create `client/scripts/generate-favicons.js` that:
1. Writes `client/public/favicon.svg` using the clean vector icon glyph with a dark background pad.
2. Uses `sharp` (installed as devDependency) or native canvas to generate:
   - `client/public/apple-touch-icon.png` (180×180)
   - `client/public/logo192.png` (192×192)
   - `client/public/logo512.png` (512×512)
   - `client/public/favicon.ico` (multi-size ICO container with 16x16, 32x32, 48x48)
3. Writes `client/public/manifest.json` configured for CodePad.

- [ ] **Step 2: Run generation script**

Run: `node client/scripts/generate-favicons.js`
Expected: Output showing all 6 public assets generated.

- [ ] **Step 3: Validate generated files**

Run: `file client/public/favicon.ico client/public/apple-touch-icon.png client/public/logo192.png client/public/logo512.png client/public/favicon.svg client/public/manifest.json`
Expected: All files exist and are identified as valid ICO, PNG, SVG, and JSON.

- [ ] **Step 4: Commit**

```bash
git add client/scripts/generate-favicons.js client/public/
git commit -m "feat(assets): generate CodePad favicons, icons, and web manifest"
```

---

### Task 3: Integrate CodePad Brand in Navbar and HTML Metadata

**Files:**
- Modify: `client/src/components/Navbar/Navbar.jsx`
- Modify: `client/index.html`

**Interfaces:**
- Consumes: `CodePadBrand` from `src/components/Brand/CodePadLogo.jsx`
- Produces: Header and page metadata branded with CodePad.

- [ ] **Step 1: Update `client/index.html`**

Update title, meta description, and icon tags:
- Title: `<title>CodePad - Fast Sandboxed Online Code Editor & IDE</title>`
- Meta description: `<meta name="description" content="CodePad - Fast sandboxed code execution engine and editor" />`
- Links:
  ```html
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  <link rel="alternate icon" href="/favicon.ico" />
  <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
  <link rel="manifest" href="/manifest.json" />
  ```

- [ ] **Step 2: Update `client/src/components/Navbar/Navbar.jsx`**

Replace lines 15-24:
```jsx
{/* Brand Title */}
<CodePadBrand />
```
Import `CodePadBrand` from `../Brand/CodePadLogo`.

- [ ] **Step 3: Run Vite build to verify compilation**

Run: `npm run build` in `client/`
Expected: Build succeeds without errors.

- [ ] **Step 4: Commit**

```bash
git add client/index.html client/src/components/Navbar/Navbar.jsx
git commit -m "feat(ui): integrate CodePad branding into Navbar and HTML metadata"
```

---

### Task 4: Update Starter Code Templates and LocalStorage Migration

**Files:**
- Modify: `client/src/boilerCodes/index.js`
- Modify: `client/src/utils/storage.js`
- Modify: `client/src/components/SplitPane/SplitPane.jsx`
- Modify: `client/src/components/Console/TestResultTab.jsx`

**Interfaces:**
- Consumes: Existing storage access functions.
- Produces: Upgraded storage keys (`codepad_*`) with seamless fallback to `leetcode_ide_*`.

- [ ] **Step 1: Update starter code greetings in `client/src/boilerCodes/index.js`**

Change all `"Hello LeetCode <Lang>!"` strings to `"Hello CodePad <Lang>!"`.

- [ ] **Step 2: Update storage keys with fallback migration in `client/src/utils/storage.js`**

Update keys to:
- `CODE_PREFIX = "codepad_code_"` (fallback: `leetcode_ide_code_`)
- `STDIN_PREFIX = "codepad_stdin_"` (fallback: `leetcode_ide_stdin_`)
- `TESTCASES_PREFIX = "codepad_testcases_"` (fallback: `leetcode_ide_testcases_`)
- `LAST_LANG_KEY = "codepad_last_lang"` (fallback: `leetcode_ide_last_lang`)
- `LAST_THEME_KEY = "codepad_last_theme"` (fallback: `leetcode_ide_last_theme`)

Implement fallback reader that checks the new key, and if not present, reads from legacy key and migrates it to the new key.

- [ ] **Step 3: Update storageKey in `client/src/components/SplitPane/SplitPane.jsx`**

Change default storageKey from `"leetcode_ide_split_ratio"` to `"codepad_split_ratio"`, checking legacy key as fallback.

- [ ] **Step 4: Update any remaining UI labels in `client/src/components/Console/TestResultTab.jsx`**

Clean up any remaining comments or header text mentioning LeetCode.

- [ ] **Step 5: Run tests and build to verify**

Run: `npm run build` in `client/`
Expected: PASS with 0 errors.

- [ ] **Step 6: Commit**

```bash
git add client/src/boilerCodes/index.js client/src/utils/storage.js client/src/components/SplitPane/SplitPane.jsx client/src/components/Console/TestResultTab.jsx
git commit -m "feat(core): update boilerplate greetings and migrate storage keys to CodePad"
```

---

### Task 5: End-to-End Verification

**Files:**
- Test all assets and builds across `client/`.

- [ ] **Step 1: Run complete build**

Run: `npm run build` in `client/`
Expected: Clean build in `dist/` with zero warnings/errors.

- [ ] **Step 2: Verify `dist/` contains public assets**

Verify that `dist/favicon.ico`, `dist/favicon.svg`, `dist/apple-touch-icon.png`, `dist/logo192.png`, `dist/logo512.png`, `dist/manifest.json` are properly copied by Vite into the output bundle.

- [ ] **Step 3: Commit and push**

```bash
git status
```
Confirm working tree is clean.
