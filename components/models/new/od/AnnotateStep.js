import Button from "@material-ui/core/Button";
import { withStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import axios from "axios";
import cookie from "js-cookie";
import React from "react";
import { i18n, withNamespaces } from "../../../../i18n";
import { buildApiUrl } from "../../../../utils/api";
import { routerPush, routerReplace } from "../../../../utils/router";
import StepContentContainer from "../StepContentContainer";

const styles = theme => ({
  header: {
    marginBottom: theme.spacing.unit * 3
  }
});

class AnnotateStep extends React.Component {
  state = {};

  componentDidMount() {
    const { estimatorId } = this.props;
    if (!estimatorId) {
      console.log("no estimator id");
      routerReplace(`/models/new/od`);
    }
  }

  handleSubmit = () => {};

  render() {
    const { classes, t } = this.props;

    return (
      <StepContentContainer width={1000}>
        <Typography className={classes.header} component="h1" variant="h5">
          {t("annotate_step.title")}
        </Typography>
        <Button color="primary" onClick={this.handleSubmit}>
          {t("annotate_step.submit_btn")}
        </Button>
      </StepContentContainer>
    );
  }
}

AnnotateStep = withStyles(styles)(AnnotateStep);
AnnotateStep = withNamespaces("models")(AnnotateStep);

export default AnnotateStep;
