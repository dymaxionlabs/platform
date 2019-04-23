import Step from "@material-ui/core/Step";
import StepLabel from "@material-ui/core/StepLabel";
import Stepper from "@material-ui/core/Stepper";
import { withStyles } from "@material-ui/core/styles";
import PropTypes from "prop-types";
import React from "react";

const styles = theme => ({
  root: {
    width: "100%"
  },
  backButton: {
    marginRight: theme.spacing.unit
  },
  instructions: {
    marginTop: theme.spacing.unit,
    marginBottom: theme.spacing.unit
  }
});

class StepperOd extends React.Component {
  state = {
    activeStep: 0
  };

  getSteps = () => {
    return this.props.steps;
  };

  getActiveStep = step => {
    let steps = this.getSteps();
    return steps.indexOf(step);
  };

  render() {
    const { classes } = this.props;
    const steps = this.getSteps();
    const activeStep = this.getActiveStep(this.props.activeStep);

    return (
      <div className={classes.root}>
        <Stepper
          className={classes.header}
          activeStep={activeStep}
          alternativeLabel
        >
          {steps.map(label => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </div>
    );
  }
}

StepperOd.propTypes = {
  classes: PropTypes.object
};

export default withStyles(styles)(StepperOd);
