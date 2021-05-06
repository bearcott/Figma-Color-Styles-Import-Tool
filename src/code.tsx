import { setupMainThread } from "react-figma/rpc";
import { parseToRgb } from "polished";
import { flatten } from "lodash";

// This plugin will open a window to prompt the user to enter a number, and
// it will then create that many rectangles on the screen.

// This file holds the main code for the plugins. It has access to the *document*.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser environment (see documentation).

// This shows the HTML page in "ui.html".
figma.showUI(__html__);

// Calls to "parent.postMessage" from within the HTML page will trigger this
// callback. The callback will be passed the "pluginMessage" property of the
// posted message.

/*
  {"functional":{"text":{"muted":"#727272","default":"#3c3c3c","dark":"#14151a","border":{"border-default":"#dbdfea","border-muted":"#eceef4","input":{"disabled-bg":"#f5f6f7","disabled-text":"#747474"}},"background":{"default":"#f9fafc"},"table":{"header":"#f9fafc"}},"icon":{"disabled":"rgba(67, 90, 111, 0.3)","default":"#727272"},"border":{"border-default":"#dbdfea","border-muted":"#eceef4"}}}

*/

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

const createColors = (key, val, path?: string): PaintStyle[] => {
  if (typeof val === "string") {
    const style = figma.createPaintStyle();
    style.name = `${path || ""}/${key}`;
    style.paints = [createSolidPaint(val)];
    return [style];
  }
  return flatten(
    Object.entries(val).map(([k, v]) =>
      createColors(k, v, `${path || ""}/${key}`)
    )
};

const generateColors = ({ code }) => {
  //parse twice because first it is an escaped string?
  console.log(JSON.parse(code));
  const allColors = JSON.parse(code);

  const localPaintStyles = figma.getLocalPaintStyles();

  const colorThings = flatten(Object.entries(allColors).map(([k, v]) =>
    createColors(k, v)
  ));
  
  //set existing paints to new paints if they have the same name
  colorThings.forEach(paint => {
    const localPaint = localPaintStyles.find(x=> paint.name === x.name);
    if (localPaint) {
      localPaint.paints = paint.paints;
      paint.remove();
    }
  })
};

// const createRectangles = (msg) => {
//   const nodes: SceneNode[] = [];
//   for (let i = 0; i < msg.count; i++) {
//     const rect = figma.createRectangle();
//     rect.x = i * 150;
//     rect.fills = [{ type: 'SOLID', color: { r: 1, g: 0.5, b: 0 } }];
//     figma.currentPage.appendChild(rect);
//     nodes.push(rect);
//   }
//   figma.currentPage.selection = nodes;
//   figma.viewport.scrollAndZoomIntoView(nodes);

// }

figma.ui.onmessage = (msg) => {
  if (msg.type === "create-colors") {
    generateColors(msg);
  }

  // One way of distinguishing between different types of messages sent from
  // your HTML page is to use an object with a "type" property like this.
  // if (msg.type === 'create-rectangles') {
  //   createRectangles(msg);
  // }

  // Make sure to close the plugin when you're done. Otherwise the plugin will
  // keep running, which shows the cancel button at the bottom of the screen.
  // figma.closePlugin();
};

setupMainThread();
