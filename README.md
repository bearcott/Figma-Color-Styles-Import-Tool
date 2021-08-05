# Figma Color Styles Import Tool

![Demo Image](demo.png)

This is a tool for importing json or JS objects into your Figma project as color styles. It also works with nested objects.

**Valid Inputs**

The tool accepts the following inputs as long as the key, value pairs point to a color.

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
