import { Paper, Typography } from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";

import { withSnackbar } from "notistack";
import PropTypes from "prop-types";
import React from "react";
import { i18n, withTranslation } from "../../i18n";
import { buildApiUrl } from "../../utils/api";
import { logout } from "../../utils/auth";
import FileDownload from "../../utils/file-download";

const styles = (theme) => ({
  root: {
    width: "100%",
    overflowX: "auto",
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(3),
  },
  table: {
    minWidth: 700,
  },
});

class TablesContent extends React.Component {
  render() {
    const { t, classes } = this.props;

    return (
      <div>
        <Typography variant="h6" gutterBottom component="h2">
          {t("tables.title")}
        </Typography>
        <Paper className={classes.root}>
          <iframe
            style={{ border: "none", width: "100vw", height: "100vh" }}
            src="https://redash-demo.dymaxionlabs.com/public/dashboards/KLb0FkID7kVVycpm0OmNCazxiZj4UulX4vnNPKbM?org_slug=default"
          ></iframe>
        </Paper>
      </div>
    );
  }
}

TablesContent.propTypes = {
  classes: PropTypes.object.isRequired,
};

TablesContent = withStyles(styles)(TablesContent);
TablesContent = withTranslation("me")(TablesContent);
TablesContent = withSnackbar(TablesContent);

export default TablesContent;
