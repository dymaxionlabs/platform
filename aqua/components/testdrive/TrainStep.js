import { LinearProgress, Button, Typography } from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";
import React from "react";
import { Link, withTranslation } from "../../i18n";
import { routerPush } from "../../utils/router";
import StepContentContainer from "../StepContentContainer";
import CodeBlock from "../CodeBlock";

const styles = (theme) => ({
  header: {
    marginBottom: theme.spacing(3),
    textAlign: "center",
  },
  progress: {
    flexGrow: 1,
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
});

const BorderLinearProgress = withStyles({
  root: {
    height: 10,
    backgroundColor: "rgb(255, 181, 173)",
  },
  bar: {
    borderRadius: 20,
    backgroundColor: "#ff6c5c",
  },
})(LinearProgress);

const apiContentByUseCase = {
  pools: { var: "pools_detector" },
  cattle: {
    var: "cattle_detector",
  },
};

let APIContent = ({ classes, t, modelVar }) => (
  <div>
    <Typography>
      When you have enough annotations and images, you can train your model.
    </Typography>
    <Typography>
      To train a model, using the Python package, execute:
    </Typography>
    <CodeBlock language="python">{`task = ${modelVar}.train()`}</CodeBlock>
    <Typography>
      Because training can take hours to complete, the <code>train()</code>{" "}
      method returns a <code>Task</code> instance, which you can use to fetch
      the task status:
    </Typography>
    <CodeBlock language="python">
      {`task.is_running()
#=> True`}
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
APIContent = withTranslation("testdrive")(APIContent);

class TrainStep extends React.Component {
  state = {
    finished: false,
    percentage: 0,
    currentModel: null,
  };

  increment = 10;
  interval = 1000;

  componentDidMount() {
    setTimeout(() => this.advanceProgressBar(), this.interval);
    this._loadCurrentModel();
  }

  advanceProgressBar() {
    const { increment, interval } = this;
    this.setState((prevState) => {
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

  _loadCurrentModel() {
    const current = window.localStorage.getItem("current");
    if (!current) {
      routerReplace("/testdrive");
      return;
    }
    const currentModel = JSON.parse(current);
    console.debug(currentModel);

    this.setState({ currentModel });
  }

  handleClickContinue() {
    this._trackEvent("TrainStep", "buttonClick");
    routerPush(`/testdrive/select`);
  }

  render() {
    const { classes, t, apiMode } = this.props;
    const { currentModel, finished, percentage } = this.state;

    let apiContent;
    if (currentModel) {
      const useCase = currentModel["useCase"];
      apiContent = apiContentByUseCase[useCase];
    }

    return (
      <StepContentContainer>
        <Typography className={classes.header} component="h1" variant="h5">
          {t("train_step.title")}
        </Typography>
        {apiMode ? (
          <APIContent modelVar={apiContent["var"]} />
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
TrainStep = withTranslation("testdrive")(TrainStep);

export default TrainStep;
