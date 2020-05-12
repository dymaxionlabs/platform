import { withStyles } from "@material-ui/core/styles";
import React from "react";
import { Link, withNamespaces } from "../../i18n";
import { routerPush } from "../../utils/router";
import StepContentContainer from "../StepContentContainer";

import { Button, Typography } from '@material-ui/core';

const styles = theme => ({
  header: {
    marginBottom: theme.spacing(3),
    textAlign: "center"
  }
});

class ResultsStep extends React.Component {
  state = {
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

  _trackEvent = (action, value) => {
    if (this.props.analytics) {
      this.props.analytics.event("testdrive", action, value);
    } 
  }

  handleClickResultMap() {
    this._trackEvent("ResultsStep","buttonClick")
    routerPush("/view/testdrive-map");
  }

  render() {
    const { classes, t } = this.props;
    const { currentModel } = this.state;

    let useCase;
    if (currentModel && currentModel["useCase"]) {
      useCase = currentModel["useCase"];
    }

    return (
      <StepContentContainer>
        <Typography className={classes.header} component="h1" variant="h5">
          {t("results_step.title")}
        </Typography>
        <Typography>{t("results_step.explanation")}</Typography>
        <Link href="/view/testdrive-map">
          <Button color="primary" variant="contained">
            {t("results_step.view_map")}
          </Button>
        </Link>
        {useCase && (
          <Link href={`/static/testdrive/${useCase}/results.json`}>
            <Button color="primary" variant="contained">
              {t("results_step.download_geojson")}
            </Button>
          </Link>
        )}
        {useCase && (
          <Link href={`/static/testdrive/${useCase}/results.csv`}>
            <Button color="primary" variant="contained">
              {t("results_step.download_csv")}
            </Button>
          </Link>
        )}
      </StepContentContainer>
    );
  }
}

ResultsStep = withStyles(styles)(ResultsStep);
ResultsStep = withNamespaces("testdrive")(ResultsStep);

export default ResultsStep;
