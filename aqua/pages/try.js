import React from "react";
import Head from "next/head";
import BasicAppbar from "../components/BasicAppbar";
import { withStyles } from "@material-ui/core/styles";
import { Paper, Typography, Button, Grid } from "@material-ui/core";
import { Link } from "../i18n";

const styles = (theme) => ({
  main: {
    width: "auto",
    display: "block", // Fix IE 11 issue.
    marginTop: theme.spacing(4),
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2),
    [theme.breakpoints.up(500 + theme.spacing(2) * 2)]: {
      width: 700,
      marginLeft: "auto",
      marginRight: "auto",
    },
  },
  root: {
    flexGrow: 1,
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: "center",
    color: theme.palette.text.secondary,
  },
  img: {
    marginBottom: theme.spacing(2),
    cursor: "pointer",
    borderRadius: 5,
  },
  desc: {
    marginBottom: theme.spacing(2),
  },
});

let Content = ({ classes }) => (
  <main className={classes.main}>
    <div className={classes.root}>
      <Grid container spacing={3}>
        <Grid item xs>
          <Paper className={classes.paper}>
            <Link href="/signup">
              <img className={classes.img} src="/static/try-signup.jpg" />
            </Link>
            <Typography className={classes.desc} gutterBottom>
              If you want to try out our API with your own images,{" "}
              <strong>sign up for free</strong>.
            </Typography>
            <Link href="/signup">
              <Button color="primary" variant="contained">
                Sign up
              </Button>
            </Link>
          </Paper>
        </Grid>
        <Grid item xs>
          <Paper className={classes.paper}>
            <Link href="/demo">
              <img className={classes.img} src="/static/try-demo.jpg" />
            </Link>
            <Typography className={classes.desc} gutterBottom>
              Or, you can go on our <strong>guided tour</strong> to understand
              how it works.
            </Typography>
            <Link href="/demo">
              <Button variant="contained">Start demo</Button>
            </Link>
          </Paper>
        </Grid>
      </Grid>
    </div>
  </main>
);

Content = withStyles(styles)(Content);

const TryPage = ({ classes }) => (
  <div>
    <Head>
      <title>Try Dymaxion Labs</title>
    </Head>
    <BasicAppbar />
    <Content />
  </div>
);

export default withStyles(styles)(TryPage);
