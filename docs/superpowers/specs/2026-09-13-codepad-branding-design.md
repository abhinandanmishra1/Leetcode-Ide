# Design Document: CodePad Brand Identity & Asset Integration

- **Target Repository**: `Leetcode-Ide`
- **Date**: 2026-09-13
- **Status**: Approved

## 1. Overview
This project updates the branding across the entire application to **CodePad**. It introduces the new official `CodePadLogo` SVG component, optimizes its presentation for the header/navbar, generates complete favicon and PWA assets, and updates page metadata, starter code templates, and persistent storage keys.

---

## 2. Architecture & Components

### 2.1 Logo Component (`src/components/Brand/CodePadLogo.jsx`)
- **Default Export (`CodePadLogo`)**:
  - The exact 220×220 SVG provided by user specification with editor frame, orange folded corner, inner editor window, window dots, syntax brackets (`< / >`), and the "CodePad" wordmark.
- **Horizontal Export (`CodePadBrand`)**:
  - Purpose: Designed specifically for the 50px-high dark header bar.
  - Layout: High-fidelity icon badge scaled to ~30px height, followed by crisp typography: `<span className="text-white font-bold text-lg font-sans">Code</span><span className="text-[#FFA116] font-bold text-lg font-sans">Pad</span>` and a sleek `<span className="text-[10px] bg-[#3a3a3a] text-gray-300 font-mono px-1.5 py-0.5 rounded font-medium ml-1.5">IDE</span>` tag.
- **Icon Export (`CodePadIcon`)**:
  - Isolated vector icon glyph without the text wordmark, perfect for square representations, favicons, or touch targets.

### 2.2 Navbar Integration (`src/components/Navbar/Navbar.jsx`)
- Replace the placeholder FontAwesome code icon and plain text "LeetCode" with `CodePadBrand`.
- Maintain all existing controls: LanguageDropdown, Reset button, and Run button.

### 2.3 Asset Generation (`client/public/`)
We will create `client/public/` with the following assets generated from the master vector design:
- `favicon.svg`: Clean, scalable vector favicon with the editor frame, orange accents, and code brackets.
- `favicon.ico`: Standard multi-size Windows/browser ICO icon.
- `apple-touch-icon.png`: 180×180 PNG icon for iOS/macOS web clips.
- `logo192.png`: 192×192 PNG icon for Android / PWA splash screens.
- `logo512.png`: 512×512 PNG icon for high-density PWA splash screens.
- `manifest.json`: Web app manifest configured with `name: "CodePad"`, `short_name: "CodePad"`, theme color `#1a1a1a`, background color `#1a1a1a`, and icon definitions.

### 2.4 HTML Metadata (`client/index.html`)
- `<title>CodePad - Fast Sandboxed Online Code Editor & IDE</title>`
- `<meta name="description" content="CodePad - Fast sandboxed code execution engine and editor" />`
- Link favicon SVG: `<link rel="icon" type="image/svg+xml" href="/favicon.svg" />`
- Link fallback ICO: `<link rel="alternate icon" href="/favicon.ico" />`
- Link apple touch icon: `<link rel="apple-touch-icon" href="/apple-touch-icon.png" />`
- Link manifest: `<link rel="manifest" href="/manifest.json" />`

### 2.5 Starter Boilerplate Templates (`src/boilerCodes/index.js`)
- Update default template greetings from `"Hello LeetCode <Lang>!"` to `"Hello CodePad <Lang>!"` for C++, Java, Python, JavaScript, TypeScript, and C.

### 2.6 LocalStorage Migration (`src/utils/storage.js` & `src/components/SplitPane/SplitPane.jsx`)
- Keys updated to `codepad_code_*`, `codepad_stdin_*`, `codepad_testcases_*`, `codepad_last_lang`, `codepad_last_theme`, and `codepad_split_ratio`.
- Storage accessors will check for the new key first; if absent, they read from the legacy `leetcode_ide_*` key and write to the new key, ensuring zero data loss for existing users.

---

## 3. Verification & Validation
1. **Visual Verification**: Verify `CodePadLogo` and `CodePadBrand` render cleanly in the navbar and standalone.
2. **Asset Validation**: Verify all files in `client/public/` exist and are valid PNG, ICO, SVG, and JSON.
3. **Build Validation**: Run `npm run build` in `client/` to ensure zero compilation or bundling errors.
