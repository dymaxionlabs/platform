import React from "react";
import PropTypes from "prop-types";

import { withStyles } from "@material-ui/core/styles";
import FileCopyIcon from "@material-ui/icons/FileCopy";
import { CopyToClipboard } from "react-copy-to-clipboard";

import { withNamespaces } from "../../i18n";
import cookie from "js-cookie";

import { IconButton, InputAdornment, Button, Typography, TextField, Paper } from '@material-ui/core';

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

class HomeContent extends React.Component {
  render() {
    const { t, classes } = this.props;
    const projectId = cookie.get("project");

    return (
      <div>
        <Paper className={classes.root}>
          <Typography variant="h4" component="h3" className={classes.title}>
            Welcome to Dymaxion Labs Platform
          </Typography>
          <div className={classes.section}>
            <Typography variant="h5" component="h3" className={classes.title}>
              {t(`home.models_title`)}
            </Typography>

            <Typography component="p" className={classes.paragraph}>
              If this is your first time here, we recommend you to do a{" "}
              <strong>Test Drive</strong> to understand what you can achieve
              with our <strong>Models</strong> application.
            </Typography>

            <a href="/testdrive" className={classes.anchorButton}>
              <Button variant="contained" color="primary">
                Test Drive
              </Button>
            </a>
          </div>
          <div className={classes.section}>
            <Typography variant="h5" component="h3" className={classes.title}>
              {t(`home.api_title`)}
            </Typography>
            <Typography component="p" className={classes.paragraph}>
              {t(`home.api_descrip1`)} <a href="/home/keys">link</a>{" "}
              {t(`home.api_descrip2`)}
            </Typography>
          </div>
          <div className={classes.section}>
            <Typography variant="h5" component="h3" className={classes.title}>
              {t(`home.project_title`)}
            </Typography>
            <Typography component="p" className={classes.paragraph}>
              {t(`home.project_descrip`)} <br />
            </Typography>
            <TextField
              id="projectId"
              variant="outlined"
              margin="normal"
              fullWidth
              defaultValue={projectId}
              InputProps={{
                readOnly: true,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton edge="end">
                      <CopyToClipboard text={projectId}>
                        <FileCopyIcon />
                      </CopyToClipboard>
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
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
HomeContent = withNamespaces("me")(HomeContent);

export default HomeContent;
