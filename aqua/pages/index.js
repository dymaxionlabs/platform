import Head from "next/head";
import PropTypes from "prop-types";
import React from "react";
import { withTranslation } from "../i18n";
import { withAuthSync } from "../utils/auth";
import { withStyles } from '@material-ui/core/styles';

import { Paper, Typography, LinearProgress } from '@material-ui/core';

const styles = theme => ({
  main: {
    width: "auto",
    display: "block", // Fix IE 11 issue.
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2),
    [theme.breakpoints.up(200 + theme.spacing(2) * 2)]: {
      width: 200,
      marginLeft: "auto",
      marginRight: "auto"
    }
  },
  paper: {
    marginTop: theme.spacing(8),
    textAlign: "center",
    padding: `${theme.spacing(2)}px ${theme.spacing(3)}px ${theme.spacing(3)}px`
  },
  header: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(3)
  },
  progressContainer: {
    flexGrow: 1
  }
});

class Index extends React.Component {
  static async getInitialProps({ res }) {
    return {
      namespacesRequired: []
    };
  }

  componentDidMount() {
    window.location.href = "/home";
  }

  render() {
    const { t, classes } = this.props;

    return (
      <div>
        <Head>
          <title>{t("title")}</title>
        </Head>
        <main className={classes.main}>
          <Paper className={classes.paper}>
            <img src="/static/logo.png" height="64" />
            <Typography className={classes.header} component="h1" variant="h5">
              {t("loading")}
            </Typography>
            <div className={classes.progressContainer}>
              <LinearProgress />
            </div>
          </Paper>
        </main>
      </div>
    );
  }
}

Index.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired
};

Index = withStyles(styles)(Index);
Index = withTranslation()(Index);
Index = withAuthSync(Index, { redirect: false });

export default Index;
