import { withStyles } from "@material-ui/core/styles";
import PropTypes from "prop-types";
import React from "react";
import { Link } from "../i18n";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";
import { Button } from "@material-ui/core";
import { Skeleton } from "@material-ui/lab";

const styles = (_theme) => ({
  button: {
    color: "white",
  },
});

class SelectProjectButton extends React.Component {
  render() {
    const { name, loading, classes } = this.props;

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
  name: PropTypes.string,
  loading: PropTypes.bool,
  token: PropTypes.string.isRequired,
  classes: PropTypes.object.isRequired,
};

SelectProjectButton = withStyles(styles)(SelectProjectButton);

export default SelectProjectButton;
