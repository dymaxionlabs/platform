import React from "react";
import { withStyles } from "@material-ui/core/styles";
import { Paper } from '@material-ui/core';

const styles = theme => ({
  main: {
    width: "auto",
    display: "block", // Fix IE 11 issue.
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2),
    [theme.breakpoints.up(500 + theme.spacing(2) * 2)]: {
      width: 500,
      marginLeft: "auto",
      marginRight: "auto"
    }
  },
  paper: {
    marginTop: theme.spacing(4),
    display: "flex",
    flexDirection: "column",
    padding: `${theme.spacing(2)}px ${theme.spacing(3)}px ${theme.spacing(3)}px`
  }
});

const StepContentContainer = ({ classes, children, width }) => (
  <main className={classes.main} style={{ width: width }}>
    <Paper className={classes.paper}>{children}</Paper>
  </main>
);

export default withStyles(styles)(StepContentContainer);
