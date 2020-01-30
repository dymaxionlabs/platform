import Button from "@material-ui/core/Button";
import { withStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import StepContentContainer from "../StepContentContainer";
import React from "react";
import { Link, withNamespaces } from "../../i18n";

const styles = theme => ({
  header: {
    marginBottom: theme.spacing.unit * 3,
    textAlign: "center"
  }
});

let InitialStep = ({ classes, t }) => (
  <StepContentContainer>
    <Typography className={classes.header} component="h1" variant="h5">
      {t("new.od.header")}
    </Typography>
    <Typography>
      (acá va el diagrama y una descripción general de todo el proceso...)
    </Typography>
    <Link href="/testdrive/choose-usecase">
      <Button color="primary" variant="contained">
        {t("new.start_building")}
      </Button>
    </Link>
  </StepContentContainer>
);

InitialStep = withStyles(styles)(InitialStep);
InitialStep = withNamespaces("models")(InitialStep);

export default InitialStep;
