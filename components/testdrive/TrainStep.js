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

class TrainStep extends React.Component {
  state = {
    finished: false,
    percentage: 0
  };


  handleClickContinue() {
    const { estimatorId } = this.props;
    routerPush(`/testdrive/select`);
  }


  render() {
    const { classes, t } = this.props;
    const { finished, percentage } = this.state;

    return (
      <StepContentContainer>
        <Typography className={classes.header} component="h1" variant="h5">
          {t("train_step.title")}
        </Typography>
        <Typography>
          {finished
            ? t("train_step.finished_explanation")
            : t("train_step.explanation")}
        </Typography>
        {finished ? (
          <Link>
            <Button
              color="primary"
              variant="contained"
              onClick={() => this.handleClickContinue()}
            >
              {t("train_step.continue")}
            </Button>
          </Link>
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
                <Typography>{t("train_step.undefined_explanation")}</Typography>
              )}
            </div>
            <Link>
              <Button
                color="primary"
                variant="contained"
                onClick={() => this.handleClickContinue()}
              >
                {t("train_step.continue")}
              </Button>
            </Link>
          </div>
        )}
      </StepContentContainer>
    );
  }
}

TrainStep = withStyles(styles)(TrainStep);
TrainStep = withNamespaces("testdrive")(TrainStep);

export default TrainStep;
