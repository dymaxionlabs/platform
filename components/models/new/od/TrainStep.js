import { LinearProgress } from "@material-ui/core";
import Button from "@material-ui/core/Button";
import { withStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import React from "react";
import { Link, withNamespaces } from "../../../../i18n";
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

let TrainStep = ({ classes, t }) => (
  <StepContentContainer>
    <Typography className={classes.header} component="h1" variant="h5">
      {t("train_step.title")}
    </Typography>
    <Typography>{t("train_step.explanation")}</Typography>
    <div className={classes.progress}>
      <LinearProgress />
    </div>
    <Link href="/home/models">
      <Button color="primary" variant="contained">
        {t("train_step.back")}
      </Button>
    </Link>
  </StepContentContainer>
);

TrainStep = withStyles(styles)(TrainStep);
TrainStep = withNamespaces("models")(TrainStep);

export default TrainStep;
