import PropTypes from "prop-types";
import React from "react";
import { Link } from "../i18n";
import { withStyles } from "@material-ui/core/styles";
import SignupButton from "../components/SignupButton";

import { AppBar, Toolbar, Typography, Button } from "@material-ui/core";

const styles = (theme) => ({
  appBar: {
    position: "relative",
  },
  logo: {
    height: 25,
    marginRight: theme.spacing(1),
    cursor: "pointer",
  },
  title: {
    cursor: "pointer",
  },
  right: {
    marginLeft: "auto",
  },
});

const BasicAppbar = withStyles(styles)(
  ({
    classes,
    showModeButton,
    showSignUp,
    modeButtonText,
    onModeButtonClick,
  }) => (
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
        <div className={classes.right}>
          {showModeButton && (
            <Button onClick={onModeButtonClick} variant="contained">
              {modeButtonText}
            </Button>
          )}
          {showSignUp && <SignupButton />}
        </div>
      </Toolbar>
    </AppBar>
  )
);

BasicAppbar.propTypes = {
  classes: PropTypes.object.isRequired,
  showSignUp: PropTypes.bool,
  showModeButton: PropTypes.bool,
  modeButtonText: PropTypes.string,
};

BasicAppbar.defaultProps = {
  showSignUp: false,
  showModeButton: false,
  modeButtonText: "",
};

export default withStyles(styles)(BasicAppbar);
