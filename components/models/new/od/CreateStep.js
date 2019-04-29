import Typography from "@material-ui/core/Typography";
import React from "react";
import { withStyles } from "@material-ui/core/styles";
import { withNamespaces } from "../../../../i18n";
import Button from "@material-ui/core/Button";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Input from "@material-ui/core/Input";

const styles = theme => ({
  submit: {
    marginTop: theme.spacing.unit * 3
  }
});

class CreateStep extends React.Component {
  state = {
    name: null,
    classes: [],
    isSubmitting: false
  };

  handleSubmit() {}

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
              autoComplete="Name"
              autoFocus
              onInput={this.handleChange}
              onChange={this.handleChange}
              value={this.state.name}
            />
          </FormControl>
          <FormControl margin="normal" required fullWidth>
            <InputLabel htmlFor="classes">
              {t("create_step.classes_label")}
            </InputLabel>
            <Input
              id="classes"
              name="classes"
              type="classes"
              autoComplete="classes"
              onInput={this.handleChange}
              onChange={this.handleChange}
              value={this.state.classes}
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
