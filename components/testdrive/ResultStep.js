import { LinearProgress } from "@material-ui/core";
import Button from "@material-ui/core/Button";
import { withStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import React from "react";
import { withNamespaces } from "../../i18n";
import StepContentContainer from "../StepContentContainer";
import { routerPush } from "../../utils/router";

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


class ResultStep extends React.Component {
  state = {
    finished: false,
    percentage: 0
  };

  increment = 10;
  interval = 750;

  componentDidMount() {
    setTimeout(() => this.advanceProgressBar(), this.interval);
  }

  advanceProgressBar() {
    const { increment, interval } = this;
    this.setState(prevState => {
      const newPerc = prevState.percentage + increment;
      if (newPerc < 100) {
        setTimeout(() => this.advanceProgressBar(increment), interval);
        return { percentage: newPerc, finished: false };
      } else {
        return { percentage: 100, finished: true };
      }
    });
  }

  handleClickResultMap() {
    routerPush("/view/MapPool");
  }

  handleClickResultGeoJSON() {
    alert("To do");
  }
  handleClickResultCSV() {
    alert("To do");
  }

  render() {
    const { classes, t } = this.props;
    

    return (
      <StepContentContainer>
        <Typography className={classes.header} component="h1" variant="h5">
          {t('result_step.title_result')}
        </Typography>
        <Button
          color="primary"
          variant="contained"
          fullWidth
          onClick={() => this.handleClickResultMap()}
        >
          {t('result_step.result_map')}
        </Button>
        <Button
          color="primary"
          variant="contained"
          fullWidth
          onClick={() => this.handleClickResultGeoJSON()}
        >
          {t('result_step.geoJSON')}
        </Button>
        <Button
          color="primary"
          variant="contained"
          fullWidth
          onClick={() => this.handleClickResultCSV()}
        >
          {t('result_step.recults_csv')}
        </Button>
      </StepContentContainer>
    );
  }
}

ResultStep = withStyles(styles)(ResultStep);
ResultStep = withNamespaces("testdrive")(ResultStep);

export default ResultStep;
