import React from "react";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import Button from "@material-ui/core/Button";
import Head from "next/head";
import { Link } from "../../i18n";

function Copyright() {
  return (
    <Typography variant="body2" color="textSecondary">
      {"Copyright © "}
      <a href="https://dymaxionlabs.com/">Dymaxion Labs</a>{" "}
      {new Date().getFullYear()}
      {"."}
    </Typography>
  );
}

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
  },
  main: {
    marginTop: theme.spacing(8),
    marginBottom: theme.spacing(2),
  },
  footer: {
    padding: theme.spacing(3, 2),
    marginTop: "auto",
    backgroundColor:
      theme.palette.type === "light"
        ? theme.palette.grey[200]
        : theme.palette.grey[800],
  },
  button: {
    marginTop: theme.spacing(3),
  },
}));

export default function ThanksPage() {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <Head>
        <title>Thanks for your order!</title>
      </Head>
      <Container component="main" className={classes.main} maxWidth="sm">
        <Typography variant="h3" component="h1" gutterBottom>
          Thanks for your order!
        </Typography>
        <Typography variant="h5" component="h2" gutterBottom>
          We appreciate your business!
        </Typography>
        <Typography variant="body1">
          If you have any questions, please email{" "}
          <a href="mailto:orders@dymaxionlabs.com">orders@dymaxionlabs.com</a>.
        </Typography>
        <Link href="/home">
          <Button
            className={classes.button}
            color="primary"
            variant="contained"
          >
            Go to Dashboard
          </Button>
        </Link>
      </Container>
      <footer className={classes.footer}>
        <Container maxWidth="sm">
          <Typography variant="body1"></Typography>
          <Copyright />
        </Container>
      </footer>
    </div>
  );
}
