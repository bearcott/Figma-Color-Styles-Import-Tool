import { CSSProperties } from "@emotion/serialize";
import { flatten } from "lodash";
import { parseToRgb } from "polished";

export enum MessageTypes {
  MissingColors = "MissingColors",
  InputColors = "InputColors",
  OutputColors = "OutputColors",
  OutputTextStyles = "OutputTextStyles",
  CopyText = "CopyText",
  Error = "Error",
  Info = "Info",
}

type ObjectTree<T> = { [key: string]: ObjectTree<T> } | T;

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

const STYLE_WEIGHT_MAP = {
  Thin: 100,
  "Extra Light": 200,
  Light: 300,
  Regular: 400,
  Medium: 500,
  "Semi Bold": 600,
  Bold: 700,
  "Extra Bold": 800,
  Black: 900,
} as const;
const TEXT_CASE_MAP = {
  ORIGINAL: "none",
  UPPER: "uppercase",
  LOWER: "lowercase",
  TITLE: "capitalize",
} as const;

/** converts the Figma TextStyle to a CSSProperties object.
 * The only prop not encoded is paragraphSpacing which is controlled by margin
 * so it is omitted
 */
export const convertTextStyleToObject = (ts: TextStyle): CSSProperties => {
  return {
    fontFamily: ts.fontName.family,
    fontWeight: STYLE_WEIGHT_MAP[ts.fontName.style],
    fontSize: `${ts.fontSize}px`,
    textTransform: TEXT_CASE_MAP[ts.textCase],
    textDecoration: ts.textDecoration.toLowerCase(),
    textIndent: `${ts.paragraphIndent}px`,
    // can only be either pixel or precent or auto
    lineHeight:
      ts.lineHeight.unit === "AUTO"
        ? "auto"
        : ts.lineHeight.unit === "PERCENT"
        ? `${ts.lineHeight.value}%`
        : `${ts.lineHeight.value}px`,
    // can only be either pixel or precent
    letterSpacing:
      ts.letterSpacing.unit === "PERCENT"
        ? `${ts.letterSpacing.value / 100}em`
        : `${ts.letterSpacing.value}px`,
  };
};

export const insertIntoNestedObject = <T, U>(
  obj: ObjectTree<T>,
  path: string[],
  val: U
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
