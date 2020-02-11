import { withStyles } from "@material-ui/core/styles";
import Head from "next/head";
import React from "react";
import BasicAppbar from "../components/BasicAppbar";
import AnnotateStep from "../components/testdrive/AnnotateStep";
import CreateStep from "../components/testdrive/CreateStep";
import ChooseUseCaseStep from "../components/testdrive/ChooseUseCaseStep";
import InitialStep from "../components/testdrive/InitialStep";
import TrainStep from "../components/testdrive/TrainStep";
import UploadStep from "../components/testdrive/UploadStep";
import SelectStep from "../components/testdrive/SelectStep";
import PredictStep from "../components/testdrive/PredictStep";
import StepperContent from "../components/testdrive/StepperContent";
import { withNamespaces } from "../i18n";
import { withAuthSync } from "../utils/auth";

const styles = theme => ({
  stepperContent: {
    width: "auto",
    display: "block", // Fix IE 11 issue.
    marginTop: theme.spacing.unit * 3,
    marginLeft: theme.spacing.unit * 2,
    marginRight: theme.spacing.unit * 2,
    [theme.breakpoints.up(700 + theme.spacing.unit * 2 * 2)]: {
      width: 700,
      marginLeft: "auto",
      marginRight: "auto"
    }
  }
});

const steps = [
  "initial",
  "choose-usecase",
  "create",
  "upload",
  "annotate",
  "train",
  "select",
  "predict"
];

const hiddenSteps = ["initial", "choose-usecase"];

class TestDrive extends React.Component {
  state = {
    step: steps[0]
  };

  static async getInitialProps({ query }) {
    return {
      namespacesRequired: ["testdrive"],
      query: query
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

  stepContent() {
    const { token } = this.props;
    const { step } = this.state;

    switch (step) {
      case "initial": {
        return <InitialStep token={token} />;
      }
      case "choose-usecase": {
        return <ChooseUseCaseStep token={token} />;
      }
      case "create": {
        return <CreateStep token={token} />;
      }
      case "upload": {
        return <UploadStep token={token} />;
      }
      case "annotate": {
        return <AnnotateStep token={token} />;
      }
      case "train": {
        return <TrainStep token={token} />;
      }
      case "select": {
        return <SelectStep token={token} />;
      }
      case "predict": {
        return <PredictStep token={token} />;
      }
    }
  }

  render() {
    const { t, classes, ...props } = this.props;

    return (
      <React.Fragment>
        <Head>
          <title>{t("header")}</title>
        </Head>
        <BasicAppbar />
        {this.stepContent()}
        <div className={classes.stepperContent}>
          <StepperContent
            activeStep={this.state.step}
            steps={steps.filter(step => !hiddenSteps.includes(step))}
            {...props}
          />
        </div>
      </React.Fragment>
    );
  }
}

TestDrive = withStyles(styles)(TestDrive);
TestDrive = withNamespaces("testdrive")(TestDrive);
TestDrive = withAuthSync(TestDrive);

export default TestDrive;
