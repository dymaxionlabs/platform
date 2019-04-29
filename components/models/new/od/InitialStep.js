import Typography from "@material-ui/core/Typography";
import React from "react";
import { withStyles } from "@material-ui/core/styles";
import { Link, withNamespaces } from "../../../../i18n";
import Button from "@material-ui/core/Button";

const styles = theme => ({});

let InitialStep = ({ classes, t }) => (
  <div>
    <Typography className={classes.header} component="h1" variant="h5">
      {t("new.od.header")}
    </Typography>
    <Link href="/models/new/od/create">
      <Button color="primary">{t("new.start_building")}</Button>
    </Link>
  </div>
);

InitialStep = withStyles(styles)(InitialStep);
InitialStep = withNamespaces("models")(InitialStep);

export default InitialStep;
