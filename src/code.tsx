import { setupMainThread } from "react-figma/rpc";
import { parseToRgb } from "polished";
import { flatten } from "lodash";

// This shows the HTML page in "ui.html".
figma.showUI(__html__, { width: 300, height: 350 });

/* Sample data

  {"functional":{"text":{"muted":"#727272","default":"#3c3c3c","dark":"#14151a","border":{"border-default":"#dbdfea","border-muted":"#eceef4","input":{"disabled-bg":"#f5f6f7","disabled-text":"#747474"}},"background":{"default":"#f9fafc"},"table":{"header":"#f9fafc"}},"icon":{"disabled":"rgba(67, 90, 111, 0.3)","default":"#727272"},"border":{"border-default":"#dbdfea","border-muted":"#eceef4"}}}
*/

export enum MessageTypes {
  MissingColors = "MissingColors",
  InputColors = "InputColors",
  Error = "Error",
}

const createSolidPaint = (color: string): SolidPaint => {
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
const createColors = (key, val, path?: string): PaintStyle[] => {
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

function isJsonString(str) {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
}

const rmPrefixSlash = (name: string): string => {
  if (name[0] === "/") return name.substring(1);
  return name;
};

const generateColors = ({ code }: { code: string }) => {
  try {
    const allColors = isJsonString(code)
      ? JSON.parse(code)
      : JSON.parse(JSON.stringify(code));
    if (typeof allColors !== "object") {
      figma.ui.postMessage({ type: "error", message: "Invalid input!" });
      return;
    }
    const localPaintStyles = figma.getLocalPaintStyles();

    const newColors = flatten(
      Object.entries(allColors).map(([k, v]) => createColors(k, v))
    ).filter((x) => x);

    // rm prefix slash
    newColors.forEach((x) => {
      x.name = rmPrefixSlash(x.name);
    });

    //set existing paints to new paints if they have the same name
    // TODO: set description
    // NOTE: there could potentially be a prefix slash that exists for some colors but ends up in same directory

    const unmatchedLocalColors = [];
    const matchingLocalColors = [];

    localPaintStyles.forEach((localPaint) => {
      const matchingNewPaint = newColors.find(
        (x) => localPaint.name === x.name
      );
      if (matchingNewPaint) {
        localPaint.paints = matchingNewPaint.paints;
        matchingLocalColors.push(matchingNewPaint);
      } else {
        unmatchedLocalColors.push(localPaint);
      }
    });

    // for some reason some colors do not exist when trying to remove them?
    // thats why its in a try catch block
    matchingLocalColors.forEach((x) => {
      try {
        x.remove();
      } catch (e) {
        console.log(e);
      }
    });
    figma.ui.postMessage({
      type: MessageTypes.MissingColors,
      colors: unmatchedLocalColors.map((x) => x.name),
    });
  } catch (e) {
    console.log(e);
    figma.ui.postMessage({ type: "error", message: e.message });
  }
};

// const changeApi = (msg) => {
//   fetch(msg.url)
// };

figma.ui.onmessage = (msg) => {
  switch (msg.type as MessageTypes) {
    // case "change-api":
    //   changeApi(msg);
    case MessageTypes.InputColors:
      generateColors(msg);
  }

  // Make sure to close the plugin when you're done. Otherwise the plugin will
  // keep running, which shows the cancel button at the bottom of the screen.
  // figma.closePlugin();
};

setupMainThread();
