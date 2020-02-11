import Step from "@material-ui/core/Step";
import StepLabel from "@material-ui/core/StepLabel";
import Stepper from "@material-ui/core/Stepper";
import { withStyles } from "@material-ui/core/styles";
import { withNamespaces } from "../../i18n";
import PropTypes from "prop-types";
import React from "react";

const styles = _theme => ({
  stepper: {
    backgroundColor: "none"
  }
});

class StepperContent extends React.Component {
  render() {
    const { t, classes, steps, activeStep } = this.props;

    const activeStepIndex = steps.indexOf(activeStep);

    return (
      <Stepper className={classes.stepper} activeStep={activeStepIndex}>
        {steps.map(label => (
          <Step key={label}>
            <StepLabel>{t(`steps.${label}`)}</StepLabel>
          </Step>
        ))}
      </Stepper>
    );
  }
}

StepperContent.propTypes = {
  classes: PropTypes.object
};

StepperContent = withStyles(styles)(StepperContent);
StepperContent = withNamespaces("testdrive")(StepperContent);

export default StepperContent;
