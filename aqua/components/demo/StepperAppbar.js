import PropTypes from "prop-types";
import React from "react";
import StepperContent from "./StepperContent";
import { Link } from "../../i18n";
import { withStyles } from '@material-ui/core/styles';

import { AppBar, Toolbar, Typography } from '@material-ui/core';

const styles = theme => ({
  appBar: {
    position: "relative"
  },
  logo: {
    height: 25,
    marginRight: theme.spacing(1),
    cursor: "pointer"
  },
  title: {
    cursor: "pointer"
  },
  stepperContent: {
    width: "auto",
    display: "block", // Fix IE 11 issue.
    marginTop: theme.spacing(3),
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2),
    [theme.breakpoints.up(700 + theme.spacing(2) * 2)]: {
      width: 700,
      marginLeft: "auto",
      marginRight: "auto"
    }
  }
});

const StepperAppbar = withStyles(styles)(({ classes, ...props }) => (
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
      <div className={classes.stepperContent}>
        <StepperContent {...props} />
      </div>
    </Toolbar>
  </AppBar>
));

StepperAppbar.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(StepperAppbar);
