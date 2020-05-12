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
    marginBottom: theme.spacing(3),
    textAlign: "center"
  },
  progress: {
    flexGrow: 1,
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2)
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

const apiContentByUseCase = {
  pools: { 
    name: "Pools detector", 
    classes: ["pool"], 
    var: "pools_detector",
    filesVar: "pools_files",
    files: "pools*.tif"
  },
  cattle: {
    name: "Cattle detector",
    classes: ["red", "black"],
    var: "cattle_detector",
    filesVar: "cattle_files",
    files: "cattle*.tif"
  }
};

let APIContent = ({ classes, t, modelVar, modelName, modelFiles, modelFilesVar }) => (
  <div>
    <Typography>
      To use your trained model on some of the uploaded images:
    </Typography>
    <CodeBlock language="python">
      {`from dymaxionlabs.models import Model
from dymaxionlabs.files import File

${modelVar} = Model.get(${JSON.stringify(modelName)})
${modelFilesVar} = File.all(${JSON.stringify(modelFiles)})
job = ${modelVar}.predict_files(${modelFilesVar})`}
    </CodeBlock>
    <Typography>
      Similarly to training, prediction also takes time, so you can fetch the
      job status:
    </Typography>
    <CodeBlock language="python">
      {`job.is_running()
# => True`}
    </CodeBlock>
    <Link href="/view/testdrive-map">
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

class PredictStep extends React.Component {
  state = {
    finished: false,
    percentage: 0
  };

  increment = 10;
  interval = 750;

  componentDidMount() {
    setTimeout(() => this.advanceProgressBar(), this.interval);
    this._loadCurrentModel();
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
    this._trackEvent("PredictStep", "buttonClick");
    routerPush("/view/testdrive-map");
  }

  render() {
    const { classes, t, apiMode } = this.props;
    const { finished, percentage, currentModel } = this.state;

    let apiContent;
    if (currentModel) {
      const useCase = currentModel["useCase"];
      apiContent = apiContentByUseCase[useCase];
    }

    return (
      <StepContentContainer>
        <Typography className={classes.header} component="h1" variant="h5">
          {t("predict_step.title")}
        </Typography>
        {apiMode ? (
          <APIContent
            modelName={apiContent["name"]}
            modelVar={apiContent["var"]}
            modelFiles={apiContent["files"]}
            modelFilesVar={apiContent["filesVar"]}
          />
        ) : (
          <React.Fragment>
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
          </React.Fragment>
        )}
      </StepContentContainer>
    );
  }
}

PredictStep = withStyles(styles)(PredictStep);
PredictStep = withNamespaces("testdrive")(PredictStep);

export default PredictStep;
