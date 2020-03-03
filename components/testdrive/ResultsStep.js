import Button from "@material-ui/core/Button";
import { withStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import React from "react";
import { Link, withNamespaces } from "../../i18n";
import StepContentContainer from "../StepContentContainer";
import { routerPush } from "../../utils/router";

const styles = theme => ({
  header: {
    marginBottom: theme.spacing.unit * 3,
    textAlign: "center"
  },
  progress: {
    flexGrow: 1,
    marginTop: theme.spacing.unit * 2,
    marginBottom: theme.spacing.unit * 2
  }
});

class ResultsStep extends React.Component {
  state = {
    currentModel: null,
    finished: false,
    percentage: 0
  };

  increment = 10;
  interval = 750;

  componentDidMount() {
    this._loadCurrentModel();
    setTimeout(() => this.advanceProgressBar(), this.interval);
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

  advanceProgressBar() {
    const { increment, interval } = this;
    this.setState(prevState => {
      const newPerc = prevState.percentage + increment;
      if (newPerc < 100) {
        setTimeout(() => this.advanceProgressBar(increment), interval);
        return { percentage: newPerc, finished: false };
      } else {
        return { percentage: 100, finished: true };
      }
    });
  }

  handleClickResultMap() {
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
          {t("result_step.title_result")}
        </Typography>
        <Button
          color="primary"
          variant="contained"
          fullWidth
          onClick={() => this.handleClickResultMap()}
        >
          {t("result_step.result_map")}
        </Button>
        {useCase && (
          <Link href={`/static/testdrive/${useCase}/results.json`}>
            <Button color="primary" variant="contained" fullWidth>
              {t("result_step.geoJSON")}
            </Button>
          </Link>
        )}
        {useCase && (
          <Link href={`/static/testdrive/${useCase}/results.csv`}>
            <Button color="primary" variant="contained" fullWidth>
              {t("result_step.recults_csv")}
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
