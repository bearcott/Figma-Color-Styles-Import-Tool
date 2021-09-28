# Figma Color Styles Import Tool

![Demo Image](demo.png)

This is a Figma plugin for importing nested json or JS objects into your Figma project as color styles.

## Installation

This plugin will be published to figma store soon. Otherwise please follow online guides for installing development plugins.

## Valid Inputs

The tool accepts the following inputs as long as the key, value pairs point to a color. (RGB, HEX, HSL, etc)

- JSON URL endpoint
- JSON
- JS Object

below is an example JS Object input:

```javascript
{
  button: {
    primary: {
      base: {
        default: "#5b81cb",
        hover: "#94b0e5",
        pressed: "#4d72ba",
        disabled: "#81808D",
      },
    },
  },
};
```

## Using Export

This tool also allows you to export local color and text styles as JSON to your clipboard.

_Text styles_

Text styles are exported as a nested JSON object that follows the React `CSSProperties` API which can be consumed in a component's style prop.

_Color styles_

currently only solid paints are exported.
