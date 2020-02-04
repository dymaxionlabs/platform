import Button from "@material-ui/core/Button";
import FormControl from "@material-ui/core/FormControl";
import FormHelperText from "@material-ui/core/FormHelperText";
import Input from "@material-ui/core/Input";
import InputLabel from "@material-ui/core/InputLabel";
import { withStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import ChipInput from "material-ui-chip-input";
import React from "react";
import { withNamespaces } from "../../i18n";
import { routerPush } from "../../utils/router";
import StepContentContainer from "../StepContentContainer";
import Snackbar from "@material-ui/core/Snackbar";

const styles = theme => ({
  header: {
    marginBottom: theme.spacing.unit * 3,
    textAlign: "center"
  },
  classesLabel: {
    paddingBottom: theme.spacing.unit
  },
  submit: {
    marginTop: theme.spacing.unit * 3
  },
  errorMessage: {
    color: "red"
  }
});

class CreateStep extends React.Component {
  state = {
    name: "",
    classes: [],
    isSubmitting: false,
    showAlerts: false,
    errorClassMsg: ""
  };

  checkClasses() {
    var current = JSON.parse(window.localStorage.getItem("current"));
    var useCase = current["useCase"];
    var chips = this.state.classes;
    const { t } = this.props;

    if (useCase == "cattle") {
      var i = chips.indexOf("red");
      var e = chips.indexOf("black");
      if (i === -1 || e === -1 || chips.length !== 2) {
        this.setState({
          errorClassMsg: `${t(
            "create_step.error_msg_wrong_classes"
          )}: "red", "black"`
        });
        this.setState({ showAlerts: true });
        return false;
      } else {
        this.setState({ showAlerts: false });
        return true;
      }
    } else if (useCase == "pools") {
      var m = chips.indexOf("pool");
      if (m === -1 || chips.length !== 1) {
        this.setState({
          errorClassMsg: `${t("create_step.error_msg_wrong_classes")}: "pool"`
        });
        this.setState({ showAlerts: true });
        return false;
      } else {
        this.setState({ showAlerts: false });
        return true;
      }
    }
  }

  handleSubmit = event => {
    event.preventDefault();

    if (!this.checkClasses()) {
      return;
    }

    // Reset messages
    this.setState({
      errorMsg: "",
      isSubmitting: true
    });

    routerPush("/testdrive/upload");
  };

  handleNameChange = e => {
    this.setState({ name: e.target.value });
  };

  handleChangeClasses = chips => {
    this.setState({ classes: chips });
    this.setState({ showAlerts: false });
  };

  render() {
    const { classes, t } = this.props;
    const { isSubmitting, errorMsg, showAlerts, errorClassMsg } = this.state;
    return (
      <StepContentContainer>
        <Typography className={classes.header} component="h1" variant="h5">
          {t("create_step.title")}
        </Typography>
        <Typography variant="body2">{t("create_step.explanation")}</Typography>
        {errorMsg && (
          <Typography className={classes.errorMessage}>{errorMsg}</Typography>
        )}
        <form
          className={classes.form}
          method="post"
          onSubmit={this.handleSubmit}
        >
          <FormControl margin="normal" required fullWidth>
            <InputLabel htmlFor="name">
              {t("create_step.name_label")}
            </InputLabel>
            <Input
              id="name"
              name="name"
              autoFocus
              onInput={this.handleNameChange}
              onChange={this.handleNameChange}
              value={this.state.name}
            />
            <FormHelperText>{t("create_step.name_helper")}</FormHelperText>
          </FormControl>
          <FormControl margin="normal" required fullWidth>
            <ChipInput
              label={t("create_step.classes_label")}
              onChange={chips => this.handleChangeClasses(chips)}
            />
            <FormHelperText>
              {t("create_step.classes_helper_1")} <kbd>Enter</kbd>
              {t("create_step.classes_helper_2")}
            </FormHelperText>
          </FormControl>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            disabled={isSubmitting}
            className={classes.submit}
          >
            {t("create_step.submit_btn")}
          </Button>
        </form>
        {showAlerts && (
          <Snackbar
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "left"
            }}
            open={showAlerts}
            autoHideDuration={6000}
            message={errorClassMsg}
          ></Snackbar>
        )}
      </StepContentContainer>
    );
  }
}

CreateStep = withStyles(styles)(CreateStep);
CreateStep = withNamespaces("testdrive")(CreateStep);

export default CreateStep;
