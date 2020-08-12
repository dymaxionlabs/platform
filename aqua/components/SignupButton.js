import PropTypes from "prop-types";
import React from "react";
import { withTranslation } from "../i18n";
import { Link } from "../i18n";
import { withStyles } from "@material-ui/core/styles";
import { Button } from "@material-ui/core";

const styles = (theme) => ({
  btn: {
    margin: theme.spacing(1),
    zIndex: 1000,
  },
});

const SignupButton = ({ t, classes }) => (
  <Link href="/signup">
    <Button className={classes.btn} color="primary" variant="contained">
      {t("btn_signup")}
    </Button>
  </Link>
);

SignupButton.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
};

export default withTranslation("testdrive")(withStyles(styles)(SignupButton));
