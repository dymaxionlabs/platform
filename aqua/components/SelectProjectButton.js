import { withStyles } from "@material-ui/core/styles";
import axios from "axios";
import cookie from "js-cookie";
import PropTypes from "prop-types";
import React from "react";
import { Link } from "../i18n";
import { buildApiUrl } from "../utils/api";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";
import { Button } from "@material-ui/core";
import { withSnackbar } from "notistack";
import { Skeleton } from "@material-ui/lab";
import { Router } from "next/router";

const styles = (theme) => ({
  button: {
    color: "white",
  },
});

class SelectProjectButton extends React.Component {
  state = {
    loading: true,
    name: null,
  };

  async componentDidMount() {
    await this.getCurrentProject();
  }

  async getCurrentProject() {
    const id = cookie.get("project");
    const { token } = this.props;

    try {
      const response = await axios.get(buildApiUrl(`/projects/${id}/`), {
        headers: { Authorization: token },
      });
      this.setState({ name: response.data.name });
    } catch (err) {
      const response = err.response;
      if (response) {
        // If project was not found, force user to select or create new project
        if (response.status === 404) {
          Router.push("/select-project");
          return;
        } else if (response.status === 401) {
          logout();
        } else {
          console.error(response);
          this.props.enqueueSnackbar(
            `Failed to load project. Server response: ${JSON.stringify(
              response.data
            )}`,
            {
              variant: "error",
            }
          );
        }
      } else {
        console.error(err);
        this.props.enqueueSnackbar(`Failed to load project`, {
          variant: "error",
        });
      }
    }

    this.setState({ loading: false });
  }

  render() {
    const { classes } = this.props;
    const { loading, name } = this.state;

    return (
      <Link href="/select-project">
        <Button className={classes.button}>
          {loading ? <Skeleton width={150} /> : name || "Select a project"}
          <ArrowDropDownIcon />
        </Button>
      </Link>
    );
  }
}

SelectProjectButton.propTypes = {
  token: PropTypes.string.isRequired,
  classes: PropTypes.object.isRequired,
};

SelectProjectButton = withStyles(styles)(SelectProjectButton);
SelectProjectButton = withSnackbar(SelectProjectButton);

export default SelectProjectButton;
