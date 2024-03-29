import React from "react";
import { withStyles } from "@material-ui/core/styles";
import { Link, withTranslation } from "../../i18n";
import StepContentContainer from "../StepContentContainer";

import { Typography, Button, Grid } from "@material-ui/core";

const styles = (theme) => ({
  header: {
    marginBottom: theme.spacing(5),
    textAlign: "center",
  },
  guide: {
    marginBottom: theme.spacing(5),
  },
  step: {
    textAlign: "center",
    marginRight: theme.spacing(2),
  },
  stepImage: {
    marginBottom: theme.spacing(1),
  },
});

const steps = [
  {
    title: "Problem",
    desc: "Object Detection in Satellite, SAR, Aerial imagery.",
  },
  {
    title: "Data",
    desc:
      "3-band imagery. Upload different indexes and band combinations besides RGB.",
  },
  {
    title: "Annotation",
    desc: "GeoJSON vector file. One rectangle per object.",
  },
  {
    title: "Modeling",
    desc:
      "RetinaNet architecture. Tuneable parameters: epochs, steps, tile size.",
  },
  {
    title: "Deploy",
    desc: "Deploy your custom model to predict in large areas.",
  },
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
GuideSteps = withTranslation("testdrive")(GuideSteps);

let InitialStep = ({ classes, t }) => (
  <StepContentContainer width={900}>
    <Typography className={classes.header} component="h1" variant="h5">
      {t("header")}
    </Typography>
    <GuideSteps />
    <Link href="/demo/choose-usecase">
      <Button color="primary" variant="contained">
        {t("start")}
      </Button>
    </Link>
  </StepContentContainer>
);

InitialStep = withStyles(styles)(InitialStep);
InitialStep = withTranslation("testdrive")(InitialStep);

export default InitialStep;
