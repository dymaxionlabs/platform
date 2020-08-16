import { withStyles } from "@material-ui/core/styles";
import React from "react";
import { withTranslation } from "../../i18n";
import StepContentContainer from "../StepContentContainer";
import { routerPush } from "../../utils/router";

import {
  Button,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
} from "@material-ui/core";

const styles = (theme) => ({
  header: {
    marginBottom: theme.spacing(3),
    textAlign: "center",
  },
  grid: {
    marginBottom: theme.spacing(2),
  },
  card: {
    display: "flex", // Fix IE 11 issue.
    flexDirection: "column",
    height: "100%",
    [theme.breakpoints.up(220 + theme.spacing(2) * 2)]: {
      marginLeft: 18,
      marginTop: 15,
    },
  },
  cardContent: {
    display: "flex",
    flex: "1 0 auto",
    alignItems: "flex-start",
    flexDirection: "column",
    height: "75%",
  },
  cardActions: {
    display: "flex",
    justifyContent: "flex-start",
  },
  image: {
    marginTop: theme.spacing(2),
    width: "100%",
    cursor: "pointer",
  },
});

const useCases = ["pools", "cattle"];

const useCasesDesc = {
  pools: {
    title: "Pools",
    desc: "Detect pools",
  },
  cattle: {
    title: "Cattle",
    desc: "Detect and count cattle",
  },
};

class ChooseUseCaseStep extends React.Component {
  handleButtonClick = (useCase) => {
    const estimator = { useCase };
    window.localStorage.setItem("current", JSON.stringify(estimator));

    routerPush("/demo/create");
  };

  render() {
    const { classes, t } = this.props;

    return (
      <StepContentContainer width={800}>
        <Typography className={classes.header} component="h1" variant="h5">
          {/* {t("new.od.header")} */}
          Choose Use Case
        </Typography>
        <Grid container spacing={1} className={classes.grid}>
          {useCases.map((useCase, i) => (
            <Grid item xs={6} key={useCase}>
              <Card className={classes.card}>
                <CardContent className={classes.cardContent}>
                  <Typography gutterBottom variant="h6" component="h3">
                    {useCasesDesc[useCase].title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    component="p"
                  >
                    {useCasesDesc[useCase].desc}
                  </Typography>
                  <img
                    className={classes.image}
                    src={`/static/testdrive/case${i + 1}.png`}
                    onClick={() => this.handleButtonClick(useCase)}
                  />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </StepContentContainer>
    );
  }
}

ChooseUseCaseStep = withStyles(styles)(ChooseUseCaseStep);
ChooseUseCaseStep = withTranslation("testdrive")(ChooseUseCaseStep);

export default ChooseUseCaseStep;
