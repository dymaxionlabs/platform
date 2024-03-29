import { withStyles } from "@material-ui/core/styles";
import Head from "next/head";
import React from "react";
import BasicAppbar from "../components/BasicAppbar";
import AnnotateStep from "../components/demo/AnnotateStep";
import CreateStep from "../components/demo/CreateStep";
import ChooseUseCaseStep from "../components/demo/ChooseUseCaseStep";
import InitialStep from "../components/demo/InitialStep";
import TrainStep from "../components/demo/TrainStep";
import UploadStep from "../components/demo/UploadStep";
import SelectStep from "../components/demo/SelectStep";
import PredictStep from "../components/demo/PredictStep";
import StepperContent from "../components/demo/StepperContent";
import { withTranslation } from "../i18n";
import ResultsStep from "../components/demo/ResultsStep";
import cookie from "js-cookie";

const styles = (theme) => ({
  stepperContent: {
    width: "auto",
    display: "block", // Fix IE 11 issue.
    marginTop: theme.spacing(3),
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2),
    [theme.breakpoints.up(700 + theme.spacing(2) * 2)]: {
      width: 700,
      marginLeft: "auto",
      marginRight: "auto",
    },
  },
  paper: {
    width: 700,
    marginTop: theme.spacing(4),
    display: "block",
    marginLeft: "auto",
    marginRight: "auto",
    flexDirection: "column",
    padding: `${theme.spacing(2)}px ${theme.spacing(3)}px ${theme.spacing(
      3
    )}px`,
  },
});

const steps = [
  "initial",
  "choose-usecase",
  "create",
  "upload",
  "annotate",
  "train",
  "select",
  "predict",
  "results",
];

const hiddenSteps = ["initial", "choose-usecase"];

class Demo extends React.Component {
  state = {
    step: steps[0],
    apiMode: false,
  };

  static async getInitialProps({ query }) {
    return {
      namespacesRequired: ["testdrive"],
      query: query,
    };
  }

  constructor(props) {
    super(props);

    const { step } = props.query;

    // Set current step based on path
    if (step && steps.includes(step)) {
      this.state.step = step;
    }
  }

  loadApiMode() {
    var apiMode = cookie.get("testdrive-api-mode") === "true";
    if (apiMode != this.state.apiMode) {
      this.setState({ apiMode });
    }
  }

  componentDidMount() {
    this.loadApiMode();
  }

  stepContent() {
    const { token, analytics } = this.props;
    const { step, apiMode } = this.state;

    switch (step) {
      case "initial": {
        return (
          <InitialStep token={token} analytics={analytics} apiMode={apiMode} />
        );
      }
      case "choose-usecase": {
        return (
          <ChooseUseCaseStep
            token={token}
            analytics={analytics}
            apiMode={apiMode}
          />
        );
      }
      case "create": {
        return (
          <CreateStep token={token} analytics={analytics} apiMode={apiMode} />
        );
      }
      case "upload": {
        return (
          <UploadStep token={token} analytics={analytics} apiMode={apiMode} />
        );
      }
      case "annotate": {
        return (
          <AnnotateStep token={token} analytics={analytics} apiMode={apiMode} />
        );
      }
      case "train": {
        return (
          <TrainStep token={token} analytics={analytics} apiMode={apiMode} />
        );
      }
      case "select": {
        return (
          <SelectStep token={token} analytics={analytics} apiMode={apiMode} />
        );
      }
      case "predict": {
        return (
          <PredictStep token={token} analytics={analytics} apiMode={apiMode} />
        );
      }
      case "results": {
        return (
          <ResultsStep token={token} analytics={analytics} apiMode={apiMode} />
        );
      }
    }
  }

  handleModeButtonClick = () => {
    this.setState(
      (prevState) => ({ apiMode: !prevState.apiMode }),
      () => {
        cookie.set("testdrive-api-mode", this.state.apiMode);
      }
    );
  };

  render() {
    const { t, classes, ...props } = this.props;
    const { step, apiMode } = this.state;

    const isHiddenStep = (step) => hiddenSteps.includes(step);
    const showStepper = !isHiddenStep(step);
    const showModeButton = !isHiddenStep(step);

    return (
      <div>
        <Head>
          <title>{t("header")}</title>
        </Head>
        <BasicAppbar
          showSignUp
          showModeButton={showModeButton}
          modeButtonText={apiMode ? t("btn_use_web_ui") : t("btn_use_api")}
          onModeButtonClick={this.handleModeButtonClick}
        />
        {this.stepContent()}
        {showStepper && (
          <div className={classes.stepperContent}>
            <StepperContent
              activeStep={step}
              steps={steps.filter((step) => !isHiddenStep(step))}
              {...props}
            />
          </div>
        )}
      </div>
    );
  }
}

Demo = withStyles(styles)(Demo);
Demo = withTranslation("testdrive")(Demo);

export default Demo;
