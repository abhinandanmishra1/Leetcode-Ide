import assert from "node:assert/strict";
import { register } from "node:module";
import React from "react";
import ReactDOMServer from "react-dom/server";

try {
  register("./jsx-loader.mjs", import.meta.url);
} catch (e) {
  // Ignore
}

const { default: CodePadLogo, CodePadBrand, CodePadIcon } = await import(
  "../CodePadLogo.jsx"
);

function render(element) {
  return ReactDOMServer.renderToStaticMarkup(element);
}

// Suite 1: Exports and Types
console.log("Testing exports and component types...");
assert.equal(typeof CodePadLogo, "function", "CodePadLogo must be a function component");
assert.equal(typeof CodePadBrand, "function", "CodePadBrand must be a function component");
assert.equal(typeof CodePadIcon, "function", "CodePadIcon must be a function component");

// Suite 2: CodePadLogo (Default Full Logo)
console.log("Testing CodePadLogo rendering...");
{
  const defaultHtml = render(React.createElement(CodePadLogo));
  assert.ok(defaultHtml.startsWith("<svg"), "Must render an <svg> root element");
  assert.ok(defaultHtml.includes('width="220"'), "Default width must be 220");
  assert.ok(defaultHtml.includes('height="220"'), "Default height must be 220");
  assert.ok(defaultHtml.includes('viewBox="0 0 220 220"'), "viewBox must be 0 0 220 220");
  assert.ok(defaultHtml.includes("Code"), "Must contain 'Code' text");
  assert.ok(defaultHtml.includes("Pad"), "Must contain 'Pad' text");
  assert.ok(defaultHtml.includes("#FFA116"), "Must contain brand orange #FFA116");
  assert.ok(defaultHtml.includes("#282828"), "Must contain brand dark #282828");
  assert.ok(defaultHtml.includes("M20 10H125L160 45V145"), "Must contain editor frame path");
  assert.ok(defaultHtml.includes("M125 10V35"), "Must contain orange folded corner");

  // Custom props
  const customHtml = render(
    React.createElement(CodePadLogo, {
      width: 100,
      height: 100,
      className: "custom-logo-class",
      "data-testid": "custom-logo",
    })
  );
  assert.ok(customHtml.includes('width="100"'), "Should accept custom width");
  assert.ok(customHtml.includes('height="100"'), "Should accept custom height");
  assert.ok(customHtml.includes('class="custom-logo-class"'), "Should accept custom className");
  assert.ok(customHtml.includes('data-testid="custom-logo"'), "Should accept extra props");
}

// Suite 3: CodePadIcon (Isolated Vector Glyph)
console.log("Testing CodePadIcon rendering...");
{
  const defaultIconHtml = render(React.createElement(CodePadIcon));
  assert.ok(defaultIconHtml.startsWith("<svg"), "Must render an <svg> root element");
  assert.ok(defaultIconHtml.includes('viewBox="0 0 160 165"'), "viewBox must be 0 0 160 165");
  assert.ok(defaultIconHtml.includes('width="30"'), "Default size should be 30 width");
  assert.ok(defaultIconHtml.includes('height="30"'), "Default size should be 30 height");
  assert.ok(defaultIconHtml.includes("M20 10H125L160 45V145"), "Must contain editor frame");
  assert.ok(defaultIconHtml.includes("M125 10V35"), "Must contain folded corner");
  assert.ok(defaultIconHtml.includes("#FFA116"), "Must contain brand orange");
  // Should NOT contain the text wordmark
  assert.ok(!defaultIconHtml.includes("<text"), "CodePadIcon should not contain text wordmark");

  // Custom size and props
  const customIconHtml = render(
    React.createElement(CodePadIcon, {
      size: 48,
      className: "custom-icon-class",
      "aria-label": "CodePad Icon",
    })
  );
  assert.ok(customIconHtml.includes('width="48"'), "Should support custom size (width)");
  assert.ok(customIconHtml.includes('height="48"'), "Should support custom size (height)");
  assert.ok(customIconHtml.includes('class="custom-icon-class"'), "Should support custom className");
  assert.ok(customIconHtml.includes('aria-label="CodePad Icon"'), "Should pass through aria attributes");
}

// Suite 4: CodePadBrand (Horizontal Navbar Lockup)
console.log("Testing CodePadBrand rendering...");
{
  const brandHtml = render(React.createElement(CodePadBrand));
  assert.ok(brandHtml.includes("<svg"), "Must include CodePadIcon");
  assert.ok(brandHtml.includes("viewBox=\"0 0 160 165\""), "Icon within brand must have viewBox 0 0 160 165");
  assert.ok(brandHtml.includes("Code"), "Must include 'Code' span");
  assert.ok(brandHtml.includes("Pad"), "Must include 'Pad' span");
  assert.ok(brandHtml.includes("IDE"), "Must include 'IDE' badge");
  assert.ok(brandHtml.includes("text-white"), "Code text must have text-white styling");
  assert.ok(brandHtml.includes("text-[#FFA116]"), "Pad text must have text-[#FFA116] styling");
  assert.ok(brandHtml.includes("bg-[#3a3a3a]"), "IDE badge must have bg-[#3a3a3a]");

  // Custom props
  const customBrandHtml = render(
    React.createElement(CodePadBrand, {
      className: "header-brand",
      id: "navbar-brand",
    })
  );
  assert.ok(customBrandHtml.includes("header-brand"), "Should merge custom className");
  assert.ok(customBrandHtml.includes('id="navbar-brand"'), "Should pass through extra props");
}

console.log("All CodePad component tests passed successfully!");
