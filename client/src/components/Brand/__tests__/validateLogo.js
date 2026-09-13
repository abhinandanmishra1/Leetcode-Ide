import { register } from "node:module";

try {
  register("./jsx-loader.mjs", import.meta.url);
} catch (e) {
  // Ignore if already registered
}

const { default: CodePadLogo, CodePadBrand, CodePadIcon } = await import(
  "../CodePadLogo.jsx"
);

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
