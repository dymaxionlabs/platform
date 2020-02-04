import Step from "@material-ui/core/Step";
import StepLabel from "@material-ui/core/StepLabel";
import Stepper from "@material-ui/core/Stepper";
import { withStyles } from "@material-ui/core/styles";
import { withNamespaces } from "../../../../i18n";
import PropTypes from "prop-types";
import React from "react";

const styles = _theme => ({
  stepper: {
    backgroundColor: "none"
  }
});

class StepperContent extends React.Component {
  state = {
    activeStep: 0
  };

  render() {
    const { t, classes, steps } = this.props;
    const { activeStep } = this.state;

    const activeStepName = steps.indexOf(activeStep);

    return (
      <React.Fragment>
        <Stepper className={classes.stepper} activeStep={activeStepName}>
          {steps.map(label => (
            <Step key={label}>
              <StepLabel>{t(`new.od.steps.${label}`)}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </React.Fragment>
    );
  }
}

StepperContent.propTypes = {
  classes: PropTypes.object
};

StepperContent = withStyles(styles)(StepperContent);
StepperContent = withNamespaces("models")(StepperContent);

export default StepperContent;
