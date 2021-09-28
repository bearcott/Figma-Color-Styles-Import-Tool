import { setupMainThread } from "react-figma/rpc";
import { flatten } from "lodash";
import {
  isJsonString,
  createColors,
  rmPrefixSlash,
  MessageTypes,
  insertIntoNestedObject,
  rgbToHex,
  convertTextStyleToObject,
} from "./helpers";

// This shows the HTML page in "ui.html".
figma.showUI(__html__, { width: 320, height: 360 });

/* Sample data

  {"functional":{"text":{"muted":"#727272","default":"#3c3c3c","dark":"#14151a","border":{"border-default":"#dbdfea","border-muted":"#eceef4","input":{"disabled-bg":"#f5f6f7","disabled-text":"#747474"}},"background":{"default":"#f9fafc"},"table":{"header":"#f9fafc"}},"icon":{"disabled":"rgba(67, 90, 111, 0.3)","default":"#727272"},"border":{"border-default":"#dbdfea","border-muted":"#eceef4"}}}
*/

/** gets the first solid paint inside a PaintStyle and nests them
 * TODO: support gradients
 */
const outputColors = () => {
  const localPaintStyles = figma.getLocalPaintStyles();
  const result = {};
  localPaintStyles.forEach((x) => {
    const firstPaint = x.paints[0];
    if (firstPaint.type === "SOLID") {
      insertIntoNestedObject<PaintStyle, string>(
        result,
        x.name.split("/").map((x) => x.split(" ").join("")),
        rgbToHex(firstPaint.color)
      );
    }
  });
  figma.ui.postMessage({
    type: MessageTypes.CopyText,
    text: JSON.stringify(result),
  });
};

const outputTextStyles = () => {
  const localTextStyles = figma.getLocalTextStyles();
  const result = {};
  localTextStyles.forEach((x) => {
    insertIntoNestedObject<TextStyle, {}>(
      result,
      x.name.split("/").map((x) => x.split(" ").join("")),
      convertTextStyleToObject(x)
    );
  });
  figma.ui.postMessage({
    type: MessageTypes.CopyText,
    text: JSON.stringify(result),
  });
};

const generateColors = ({ code }: { code: string }) => {
  try {
    if (code.length === 0) {
      figma.ui.postMessage({
        type: MessageTypes.Error,
        message: "Nothing to import",
      });
      return;
    }
    /* DANGER: using eval! It's fine here since ths tool is meant to be entirely client side. */
    const allColors = isJsonString(code) ? JSON.parse(code) : eval(`(${code})`);
    if (typeof allColors !== "object") {
      figma.ui.postMessage({
        type: MessageTypes.Error,
        message: "Invalid input!",
      });
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
    figma.ui.postMessage({
      type: MessageTypes.Info,
      message: "Done!",
    });
  } catch (e) {
    console.log(e);
    figma.ui.postMessage({ type: MessageTypes.Error, message: e.message });
  }
};

figma.ui.onmessage = (msg) => {
  switch (msg.type as MessageTypes) {
    case MessageTypes.InputColors:
      generateColors(msg);
      break;
    case MessageTypes.OutputColors:
      outputColors();
      break;
    case MessageTypes.OutputTextStyles:
      outputTextStyles();
      break;
  }

  // Make sure to close the plugin when you're done. Otherwise the plugin will
  // keep running, which shows the cancel button at the bottom of the screen.
  // figma.closePlugin();
};

setupMainThread();
