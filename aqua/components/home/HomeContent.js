import React from "react";
import PropTypes from "prop-types";

import { withStyles } from "@material-ui/core/styles";
import FileCopyIcon from "@material-ui/icons/FileCopy";
import { CopyToClipboard } from "react-copy-to-clipboard";
import Link from "next/link";

import { withTranslation } from "../../i18n";
import cookie from "js-cookie";

import {
  IconButton,
  InputAdornment,
  Button,
  Typography,
  TextField,
  Paper,
} from "@material-ui/core";

const styles = (theme) => ({
  root: {
    width: "100%",
    overflowX: "auto",
    padding: "20px",
  },
  table: {
    minWidth: 700,
  },
  title: {
    marginBottom: theme.spacing(2),
  },
  paragraph: {
    marginBottom: theme.spacing(1),
  },
  anchorButton: {
    textDecoration: "none",
  },
  section: {
    marginBottom: theme.spacing(2),
  },
});

const P = withStyles(styles)(({ children, classes }) => (
  <Typography variant="body1" component="p" className={classes.paragraph}>
    {children}
  </Typography>
));

class HomeContent extends React.Component {
  render() {
    const { t, classes } = this.props;
    const projectId = cookie.get("project");

    return (
      <div>
        <Paper className={classes.root}>
          <Typography variant="h5" component="h2" className={classes.title}>
            Welcome to Dymaxion Labs Platform
          </Typography>
          <div className={classes.section}>
            <Typography variant="h6" component="h3" className={classes.title}>
              {t(`home.models_title`)}
            </Typography>
            <P>
              If this is your first time here, we recommend you to do a{" "}
              <strong>Test Drive</strong> to understand what you can achieve
              with our <strong>Models</strong> application.
            </P>
            {/* <a href="/testdrive" className={classes.anchorButton}> */}
            <Link href="/testdrive">
              <Button variant="contained" color="primary">
                Test Drive
              </Button>
            </Link>
          </div>
          <div className={classes.section}>
            <Typography variant="h6" component="h3" className={classes.title}>
              API and Python SDK
            </Typography>
            <P>
              Generate an API Key from the{" "}
              <Link href="/home/keys">
                <a>Keys</a>
              </Link>{" "}
              section to interact with our API using{" "}
              <a href="https://docs.dymaxionlabs.com/" target="_blank">
                Python
              </a>
              .
            </P>
            <P>
              Check out the{" "}
              <a
                href="https://docs.dymaxionlabs.com/en/latest/#tutorial"
                target="_blank"
              >
                Tutorial
              </a>{" "}
              in the Python SDK documentation, and this{" "}
              <a
                href="https://colab.research.google.com/drive/1LBME8Fn8n1WuWey4I3Icu8K9UWzOgj3i?usp=sharing"
                target="_blank"
              >
                Google Colaboratory notebook
              </a>
              .
            </P>
          </div>
        </Paper>
      </div>
    );
  }
}

HomeContent.propTypes = {
  classes: PropTypes.object.isRequired,
};

HomeContent = withStyles(styles)(HomeContent);
HomeContent = withTranslation("me")(HomeContent);

export default HomeContent;
