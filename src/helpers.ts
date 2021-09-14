import { flatten } from "lodash";
import { parseToRgb } from "polished";

export enum MessageTypes {
  MissingColors = "MissingColors",
  InputColors = "InputColors",
  OutputColors = "OutputColors",
  CopyText = "CopyText",
  Error = "Error",
  Info = "Info",
}

type PaintTree = { [key: string]: PaintTree } | PaintStyle;

export const copyTextToClipboard = (text) =>
  new Promise((res) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;

    // Avoid scrolling to bottom
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      res(document.execCommand("copy"));
    } catch (err) {
      res(false);
      console.error("error:", err);
    }

    document.body.removeChild(textArea);
  });

const componentToHex = (c) => {
  const hex = Math.round(c * 255).toString(16);
  return hex.length == 1 ? "0" + hex : hex;
};

export const rgbToHex = ({ r, g, b }) => {
  return `#${componentToHex(r)}${componentToHex(g)}${componentToHex(b)}`;
};

export const insertIntoNestedPaintObject = (
  obj: PaintTree,
  path: string[],
  val: string
) => {
  const keys = path;
  const lastKey = keys.pop();
  const lastObj = keys.reduce((obj, key) => (obj[key] = obj[key] || {}), obj);
  lastObj[lastKey] = val;
};

export const createSolidPaint = (color: string): SolidPaint => {
  if (!color) return null;
  const col = parseToRgb(color);
  return {
    color: {
      r: col.red / 255,
      g: col.green / 255,
      b: col.blue / 255,
    },
    type: "SOLID",
  };
};

/** recursive function to generate color objects in figma */
export const createColors = (key, val, path?: string): PaintStyle[] => {
  if (typeof val === "string") {
    try {
      const style = figma.createPaintStyle();
      const paint = createSolidPaint(val);
      style.name = `${path || ""}/${key}`;
      style.paints = [paint];
      return [style];
    } catch (e) {
      console.log(e);
      return;
    }
  }
  return flatten(
    Object.entries(val).map(([k, v]) =>
      createColors(k, v, `${path || ""}/${key}`)
    )
  );
};

export const isJsonString = (str) => {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
};

export const rmPrefixSlash = (name: string): string => {
  if (name[0] === "/") return name.substring(1);
  return name;
};
