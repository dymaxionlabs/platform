import { LinearProgress } from "@material-ui/core";
import Button from "@material-ui/core/Button";
import { withStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import React from "react";
import { Link, withNamespaces } from "../../i18n";
import { routerPush } from "../../utils/router";
import StepContentContainer from "../StepContentContainer";

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

class PredictStep extends React.Component {
  state = {
    finished: false,
    percentage: 0
  };


  handleClickContinue() {
    const { estimatorId } = this.props;
    routerPush(`/models/new/od/select?id=${estimatorId}`);
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
            ? t("train_step.finished_explanation")
            : t("predict_step.explanation")}
        </Typography>
        {finished ? (
          <Link>
            <Button
              color="primary"
              variant="contained"
              onClick={() => this.handleClickContinue()}
            >
              {t("predict_step.continue")}
            </Button>
          </Link>
        ) : (
          <div>
            <Link>
              <Button
                color="primary"
                variant="contained"
                onClick={() => this.handleClickContinue()}
              >
                {t("predict_step.continue")}
              </Button>
            </Link>
          </div>
        )}
      </StepContentContainer>
    );
  }
}

PredictStep = withStyles(styles)(PredictStep);
PredictStep = withNamespaces("testdrive")(PredictStep);

export default PredictStep;
