import Button from "@material-ui/core/Button";
import { withStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import React from "react";
import { withNamespaces } from "../../i18n";
import StepContentContainer from "../StepContentContainer";
import { routerPush } from "../../utils/router";

const styles = theme => ({
  header: {
    marginBottom: theme.spacing.unit * 3,
    textAlign: "center"
  }
});

const useCases = ["pools", "cattle"];

class ChooseUseCaseStep extends React.Component {
  handleButtonClick = useCase => {
    const estimator = { useCase };
    window.localStorage.setItem("current", JSON.stringify(estimator));

    routerPush("/testdrive/create");
  };

  render() {
    const { classes, t } = this.props;

    return (
      <StepContentContainer>
        <Typography className={classes.header} component="h1" variant="h5">
          {t("new.od.header")}
        </Typography>
        {useCases.map(useCase => (
          <Button
            key={useCase}
            variant="contained"
            onClick={() => this.handleButtonClick(useCase)}
          >
            {useCase}
          </Button>
        ))}
      </StepContentContainer>
    );
  }
}

ChooseUseCaseStep = withStyles(styles)(ChooseUseCaseStep);
ChooseUseCaseStep = withNamespaces("models")(ChooseUseCaseStep);

export default ChooseUseCaseStep;
