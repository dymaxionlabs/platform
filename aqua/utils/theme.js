import { createMuiTheme } from "@material-ui/core/styles";
import { indigo, red, blue, pink } from "@material-ui/core/colors";

// Create a theme instance.
const theme = createMuiTheme({
  palette: {
    primary: indigo,
    secondary: {
      main: pink[500],
    },
    error: {
      main: red.A400,
    },
    background: {
      default: "#fff",
    },
  },
});

export default theme;
