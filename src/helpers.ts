import { flatten } from "lodash";
import { parseToRgb } from "polished";

export enum MessageTypes {
  MissingColors = "MissingColors",
  InputColors = "InputColors",
  Error = "Error",
  Info = "Info",
}

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
