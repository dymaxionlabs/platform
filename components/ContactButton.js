import PropTypes from "prop-types";
import React from "react";
import { withTranslation } from "../i18n";
import { withStyles } from '@material-ui/core/styles';
import { Button } from '@material-ui/core';

const styles = theme => ({
  btn: {
    position: "fixed",
    right: 10,
    bottom: 10,
    margin: theme.spacing(1),
    zIndex: 1000
  }
});

const ContactButton = ({ t, classes }) => (
  <a href="https://dymaxionlabs.com/contact" target="_blank">
    <Button className={classes.btn} color="primary" variant="contained">
      {t("btn_contact_modal")}
    </Button>
  </a>
);

ContactButton.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired
};

export default withTranslation("testdrive")(withStyles(styles)(ContactButton));
