import { readFile } from "node:fs/promises";
import { transform } from "sucrase";

export async function load(url, context, nextLoad) {
  if (url.endsWith(".jsx") || url.includes(".jsx?")) {
    const raw = await readFile(new URL(url), "utf8");
    const transformed = transform(raw, { transforms: ["jsx"] }).code;
    return {
      format: "module",
      shortCircuit: true,
      source: transformed,
    };
  }
  return nextLoad(url, context);
}
