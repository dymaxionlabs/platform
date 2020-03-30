import React from "react";
import PropTypes from "prop-types";

import { withStyles } from "@material-ui/core/styles";
import IconButton from "@material-ui/core/IconButton";
import InputAdornment from "@material-ui/core/InputAdornment";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import Paper from "@material-ui/core/Paper";
import FileCopyIcon from "@material-ui/icons/FileCopy";
import { CopyToClipboard } from "react-copy-to-clipboard";

import { withNamespaces } from "../../i18n";
import cookie from "js-cookie";

const styles = theme => ({
  root: {
    width: "100%",
    overflowX: "auto",
    padding: "20px"
  },
  table: {
    minWidth: 700
  },
  title: {
    marginBottom: theme.spacing.unit * 2
  },
  paragraph: {
    marginBottom: theme.spacing.unit
  },
  anchorButton: {
    textDecoration: "none"
  },
  section: {
    marginBottom: theme.spacing.unit * 2
  }
});

class HomeContent extends React.Component {
  render() {
    const { t, beta, classes } = this.props;
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

            {beta && (
              <Typography component="p" className={classes.paragraph}>
                {t(`home.models_descrip`)} <a href="/models">link</a>.
              </Typography>
            )}
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
                )
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
  beta: PropTypes.bool
};

HomeContent.defaultProps = {
  beta: false
};

HomeContent = withStyles(styles)(HomeContent);
HomeContent = withNamespaces("me")(HomeContent);

export default HomeContent;
