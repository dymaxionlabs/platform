import Button from "@material-ui/core/Button";
import PropTypes from "prop-types";
import React from "react";
import { withNamespaces, Link } from "../../i18n";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
  root: {
    position: "fixed",
    top: 10,
    left: 10,
    zIndex: 1000,
    margin: theme.spacing(1)
  },
  menu: {
    position: "fixed",
    top: 40,
    zIndex: 1000
  },
  anchor: {
    color: "rgba(0, 0, 0, 0.87)",
    textDecoration: "none"
  }
});

class ResultsButton extends React.Component {
  state = {
    contextualMenuOpen: null,
    contactModalOpen: false,
    currentModel: null
  };

  componentDidMount() {
    this._loadCurrentModel();
  }

  _loadCurrentModel() {
    const current = window.localStorage.getItem("current");
    if (!current) {
      routerReplace.replace("/testdrive");
      return;
    }
    const currentModel = JSON.parse(current);
    console.debug(currentModel);

    this.setState({ currentModel });
  }

  onClick = e => {
    console.log("resultsbutton click");
  };

  handleContextualMenuClick = event => {
    this.setState({ contextualMenuOpen: event.currentTarget });
  };

  handleContextualMenuClose = () => {
    this.setState({ contextualMenuOpen: null });
  };

  render() {
    const { classes, t } = this.props;
    const { contextualMenuOpen, currentModel } = this.state;

    let useCase;
    if (currentModel && currentModel["useCase"]) {
      useCase = currentModel["useCase"];
    }

    return useCase ? (
      <div>
        <Button
          color="primary"
          variant="contained"
          onClick={this.handleContextualMenuClick}
        >
          {t("results_step.download_btn")}
        </Button>

        <Menu
          anchorEl={contextualMenuOpen}
          keepMounted
          open={Boolean(contextualMenuOpen)}
          onClose={this.handleContextualMenuClose}
          className={classes.menu}
        >
          <MenuItem>
            <a
              href={`/static/testdrive/${useCase}/results.json`}
              target="_blank"
              rel="noopener"
              className={classes.anchor}
            >
              {t("results_step.download_geojson")}
            </a>
          </MenuItem>
          <MenuItem>
            <a
              href={`/static/testdrive/${useCase}/results.csv`}
              target="_blank"
              rel="noopener"
              className={classes.anchor}
            >
              {t("results_step.download_csv")}
            </a>
          </MenuItem>
        </Menu>
      </div>
    ) : (
      <div></div>
    );
  }
}

ResultsButton.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  isAuthenticated: PropTypes.bool
};

ResultsButton.defaultProps = {
  isAuthenticated: false
};

ResultsButton = withStyles(styles)(ResultsButton);
ResultsButton = withNamespaces("testdrive")(ResultsButton);

export default ResultsButton;
