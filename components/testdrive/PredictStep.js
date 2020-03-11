import { LinearProgress } from "@material-ui/core";
import Button from "@material-ui/core/Button";
import { withStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import React from "react";
import { Link, withNamespaces } from "../../i18n";
import { routerPush } from "../../utils/router";
import StepContentContainer from "../StepContentContainer";
import router from "next/dist/lib/router";

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

const BorderLinearProgress = withStyles({
  root: {
    height: 10,
    backgroundColor: "rgb(255, 181, 173)"
  },
  bar: {
    borderRadius: 20,
    backgroundColor: "#ff6c5c"
  }
})(LinearProgress);

const INCREMENT = 5;
const INTERVAL = 250;

class PredictStep extends React.Component {
  state = {
    finished: false,
    percentage: 0
  };

  increment = 10;
  interval = 750;

  componentDidMount() {
    setTimeout(() => this.advanceProgressBar(), this.interval);
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

  handleClickContinue() {
    routerPush("/view/testdrive-map");
  }

  render() {
    const { classes, t } = this.props;
    const { finished, percentage } = this.state;

    return (
      <StepContentContainer>
        <Typography className={classes.header} component="h1" variant="h5">
          {t("predict_step.title")}
        </Typography>
        <Typography>
          {finished
            ? t("predict_step.finished_explanation")
            : t("predict_step.explanation")}
        </Typography>
        {finished ? (
          <Button
            color="primary"
            variant="contained"
            fullWidth
            onClick={() => this.handleClickContinue()}
          >
            {t("predict_step.continue")}
          </Button>
        ) : (
          <div>
            <div className={classes.progress}>
              {percentage <= 100 ? (
                <BorderLinearProgress
                  className={classes.margin}
                  variant="determinate"
                  color="secondary"
                  value={percentage}
                />
              ) : (
                <Typography>
                  {t("predict_step.undefined_explanation")}
                </Typography>
              )}
            </div>
          </div>
        )}
      </StepContentContainer>
    );
  }
}

PredictStep = withStyles(styles)(PredictStep);
PredictStep = withNamespaces("testdrive")(PredictStep);

export default PredictStep;
