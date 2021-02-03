import { Paper, Typography } from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";

import { withSnackbar } from "notistack";
import PropTypes from "prop-types";
import cookie from "js-cookie";
import axios from "axios";
import React from "react";
import { withTranslation } from "../../i18n";
import { buildApiUrl } from "../../utils/api";
import { logout } from "../../utils/auth";

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
  state = {
    loading: true,
  };

  async getDashboard() {
    const projectId = cookie.get("project");

    try {
      const response = await axios.get(buildApiUrl(`/projects/${projectId}/`), {
        headers: { Authorization: this.props.token },
      });
      console.log(response.data);
      this.setState({
        dashboardUrl: response.data.redash_dashboard_url,
      });
    } catch (err) {
      const response = err.response;
      if (response && response.status === 401) {
        logout();
      } else {
        console.error(response);
        this.props.enqueueSnackbar("Failed to get dashboard content", {
          variant: "error",
        });
      }
    }
  }

  async componentDidMount() {
    await this.getDashboard();
    this.setState({ loading: false });
  }

  render() {
    const { t, classes } = this.props;
    const { dashboardUrl } = this.state;

    return (
      <div>
        <Typography variant="h6" gutterBottom component="h2">
          {t("tables.title")}
        </Typography>
        <Paper className={classes.root}>
          <iframe
            style={{ border: "none", width: "100vw", height: "100vh" }}
            src={dashboardUrl}
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
