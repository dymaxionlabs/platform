import { createMuiTheme } from '@material-ui/core/styles';
import { red, blue, pink } from '@material-ui/core/colors';

// Create a theme instance.
const theme = createMuiTheme({
  palette: {
    primary: blue,
    secondary: pink,
    error: {
      main: red.A400,
    },
    background: {
      default: '#fff',
    },
  },
});

export default theme;
