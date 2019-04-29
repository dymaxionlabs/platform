import Typography from "@material-ui/core/Typography";
import React from "react";
import { withStyles } from "@material-ui/core/styles";
import { withNamespaces } from "../../../../i18n";
import Button from "@material-ui/core/Button";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Input from "@material-ui/core/Input";
import ChipInput from "material-ui-chip-input";

const styles = theme => ({
  classesLabel: {
    paddingBottom: theme.spacing.unit
  },
  submit: {
    marginTop: theme.spacing.unit * 3
  }
});

class CreateStep extends React.Component {
  state = {
    name: "",
    classes: [],
    isSubmitting: false
  };

  handleSubmit = event => {
    event.preventDefault();
  };

  handleNameChange = e => {
    this.setState({ name: e.target.value });
  };

  handleChangeClasses = chips => {
    this.setState({ classes: chips });
  };

  render() {
    const { classes, t } = this.props;
    const { isSubmitting } = this.state;

    return (
      <div>
        <Typography className={classes.header} component="h1" variant="h5">
          {t("create_step.title")}
        </Typography>
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
          </FormControl>
          <FormControl margin="normal" fullWidth>
            <ChipInput
              label={t("create_step.classes_label")}
              onChange={chips => this.handleChangeClasses(chips)}
            />
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
      </div>
    );
  }
}

CreateStep = withStyles(styles)(CreateStep);
CreateStep = withNamespaces("models")(CreateStep);

export default CreateStep;
