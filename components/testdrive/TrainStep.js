import { LinearProgress } from "@material-ui/core";
import Button from "@material-ui/core/Button";
import { withStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import React from "react";
import { Link, withNamespaces } from "../../i18n";
import { routerPush } from "../../utils/router";
import StepContentContainer from "../StepContentContainer";
import CodeBlock from "../CodeBlock";

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

let APIContent = ({ classes, t }) => (
  <div>
    <Typography>
      When you have enough annotations and images, you can train your model.
    </Typography>
    <Typography>
      To train a model, using the Python package, execute:
    </Typography>
    <CodeBlock language="python">
      {`from dymaxionlabs.models import Model

pools_detector = Model.get("Pools detector")
job = pools_detector.train()`}
    </CodeBlock>
    <Typography>
      Because training can take hours to complete, the <code>train()</code>{" "}
      method returns a<code>Job</code> instance, which you can use to fetch the
      job status:
    </Typography>
    <CodeBlock language="python">
      {`job.is_running()
# => True`}
    </CodeBlock>
    <Link href="/testdrive/select">
      <Button
        type="submit"
        fullWidth
        variant="contained"
        color="primary"
        className={classes.submit}
      >
        {t("next_btn")}
      </Button>
    </Link>
  </div>
);

APIContent = withStyles(styles)(APIContent);
APIContent = withNamespaces("testdrive")(APIContent);

class TrainStep extends React.Component {
  state = {
    finished: false,
    percentage: 0
  };

  increment = 10;
  interval = 1000;

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

  _trackEvent = (action, value) => {
    if (this.props.analytics) {
      this.props.analytics.event("testdrive", action, value);
    }
  };

  handleClickContinue() {
    this._trackEvent("TrainStep", "buttonClick");
    routerPush(`/testdrive/select`);
  }

  render() {
    const { classes, t, apiMode } = this.props;
    const { finished, percentage } = this.state;

    return (
      <StepContentContainer>
        <Typography className={classes.header} component="h1" variant="h5">
          {t("train_step.title")}
        </Typography>
        {apiMode ? (
          <APIContent />
        ) : (
          <React.Fragment>
            <Typography>
              {finished
                ? t("train_step.finished_explanation")
                : t("train_step.explanation")}
            </Typography>
            {finished ? (
              <Button
                color="primary"
                variant="contained"
                fullWidth
                onClick={() => this.handleClickContinue()}
              >
                {t("train_step.continue")}
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
                      {t("train_step.undefined_explanation")}
                    </Typography>
                  )}
                </div>
              </div>
            )}
          </React.Fragment>
        )}
      </StepContentContainer>
    );
  }
}

TrainStep = withStyles(styles)(TrainStep);
TrainStep = withNamespaces("testdrive")(TrainStep);

export default TrainStep;
