import { LinearProgress } from "@material-ui/core";
import Button from "@material-ui/core/Button";
import { withStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import axios from "axios";
import React from "react";
import { i18n, Link, withNamespaces } from "../../../../i18n";
import { buildApiUrl } from "../../../../utils/api";
import StepContentContainer from "../StepContentContainer";

const styles = theme => ({
  header: {
    marginBottom: theme.spacing.unit * 3,
    textAlign: "center"
  },
  progress: {
    flexGrow: 1,
    marginTop: theme.spacing.unit * 2,
    marginBottom: theme.spacing.unit * 2
  }
});

class PredictStep extends React.Component {
  state = {
    finished: false
  };

  async checkFinishedPredictingJob(){
    const { token, estimatorId } = this.props;
    const response = await axios.get(
      buildApiUrl(`/estimators/${estimatorId}/predicted/`),
      {
        headers: {
          Authorization: token,
          "Accept-Language": i18n.language
        }
    });
    if(response.data.detail){
      this.setState({finished: true});
      clearInterval(this.interval);
    }
  }

  handleClickView(){  
  }

  async componentDidMount() {
    this.interval = setInterval(() => this.checkFinishedPredictingJob(), 1000);
  }

  render() {
    const { classes, t } = this.props;
    const { finished } = this.state;

    return (
      <StepContentContainer>
        <Typography className={classes.header} component="h1" variant="h5">
          {t("predict_step.title")}
        </Typography>
        <Typography>{t("predict_step.explanation")}</Typography>
        { finished 
          ? 
          <Link>
            <Button color="primary" variant="contained" onClick={this.handleClickView}>
              {t("predict_step.view")}
            </Button>
          </Link>
          :
          <div>
          <div className={classes.progress}>
            <LinearProgress />
          </div>
          <Link href="/home/models">
            <Button color="primary" fullWidth="true" variant="contained" >
              {t("predict_step.back")}
            </Button>
          </Link>
          </div>
        }
      </StepContentContainer>
    );
  }
}

PredictStep = withStyles(styles)(PredictStep);
PredictStep = withNamespaces("models")(PredictStep);

export default PredictStep;
