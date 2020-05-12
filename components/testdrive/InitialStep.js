import React from "react";
import { withStyles } from "@material-ui/core/styles";
import { Link, withNamespaces } from "../../i18n";
import StepContentContainer from "../StepContentContainer";

import { Typography, Button, Grid } from '@material-ui/core';

const styles = theme => ({
  header: {
    marginBottom: theme.spacing(5),
    textAlign: "center"
  },
  guide: {
    marginBottom: theme.spacing(5)
  },
  step: {
    textAlign: "center",
    marginRight: theme.spacing(2)
  },
  stepImage: {
    marginBottom: theme.spacing(1)
  }
});

const steps = [
  {
    title: "Problem",
    desc: "Problem definition. Available data. Alternative sources."
  },
  {
    title: "Data",
    desc: "Data wrangling. Preprocessing. Outlier removal."
  },
  {
    title: "Annotation",
    desc: "Imagery labeling. Experts validation. Ground truth."
  },
  {
    title: "Modeling",
    desc: "Train/Test split. Deep Neural Network. Hyperparameters."
  },
  {
    title: "Deploy",
    desc: "Map tile server. Data compression. Visualization."
  }
];

let GuideSteps = ({ classes, t }) => (
  <Grid container className={classes.guide} justify="center">
    {steps.map((step, i) => (
      <Grid item xs={2} className={classes.step} key={`step${i}`}>
        <img
          className={classes.stepImage}
          height={64}
          src={`/static/testdrive/step${i + 1}.png`}
        />
        <Typography variant="h6">{step.title}</Typography>
        <Typography variant="body2">{step.desc}</Typography>
      </Grid>
    ))}
  </Grid>
);

GuideSteps = withStyles(styles)(GuideSteps);
GuideSteps = withNamespaces("testdrive")(GuideSteps);

let InitialStep = ({ classes, t }) => (
  <StepContentContainer width={900}>
    <Typography className={classes.header} component="h1" variant="h5">
      {t("header")}
    </Typography>
    <GuideSteps />
    <Link href="/testdrive/choose-usecase">
      <Button color="primary" variant="contained">
        {t("start")}
      </Button>
    </Link>
  </StepContentContainer>
);

InitialStep = withStyles(styles)(InitialStep);
InitialStep = withNamespaces("testdrive")(InitialStep);

export default InitialStep;
