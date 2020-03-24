import AppBar from "@material-ui/core/AppBar";
import withStyles from "@material-ui/core/styles/withStyles";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import PropTypes from "prop-types";
import React from "react";
import { Link } from "../i18n";
import Button from "@material-ui/core/Button";

const styles = theme => ({
  appBar: {
    position: "relative"
  },
  logo: {
    height: 25,
    marginRight: theme.spacing.unit,
    cursor: "pointer"
  },
  title: {
    cursor: "pointer"
  }
});

const BasicAppbar = withStyles(styles)(
  ({ classes, showModeButton, modeButtonText, onModeButtonClick }) => (
    <AppBar position="absolute" color="default" className={classes.appBar}>
      <Toolbar>
        <Link href="/">
          <img src="/static/logo.png" className={classes.logo} />
        </Link>
        <Link href="/">
          <Typography
            variant="h6"
            color="inherit"
            noWrap
            className={classes.title}
          >
            Dymaxion Labs Platform
          </Typography>
        </Link>

        {showModeButton && (
          <Button
            style={{ marginLeft: "auto" }}
            onClick={onModeButtonClick}
            color="primary"
            variant="contained"
          >
            <Typography
              variant="h6"
              color="inherit"
              noWrap
              className={classes.title}
            >
              {modeButtonText}
            </Typography>
          </Button>
        )}
      </Toolbar>
    </AppBar>
  )
);

BasicAppbar.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(BasicAppbar);
