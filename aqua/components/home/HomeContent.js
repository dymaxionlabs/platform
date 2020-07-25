import {
  Button,
  Typography,
  Card,
  CardContent,
  CardActions,
  CardActionArea,
  Grid,
} from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";
import cookie from "js-cookie";
import PropTypes from "prop-types";
import React from "react";
import { withTranslation, Link } from "../../i18n";

const styles = (theme) => ({
  root: {
    flexGrow: 1,
  },
});

let WelcomeCard = ({ classes }) => (
  <Card className={classes.cardRoot}>
    <CardContent>
      <Typography gutterBottom variant="h5" component="h2">
        Welcome to Dymaxion Labs Platform
      </Typography>
      <Typography variant="body2" color="textSecondary" component="p">
        If this is your first time here, we recommend you to do a{" "}
        <strong>Test Drive</strong> to understand what you can achieve with our{" "}
        <strong>Models</strong> application.
      </Typography>
    </CardContent>
    <CardActions>
      <Link href="/testdrive">
        <Button size="small" color="primary">
          Test Drive
        </Button>
      </Link>
    </CardActions>
  </Card>
);

WelcomeCard = withStyles(styles)(WelcomeCard);

let CreditsCard = ({ classes }) => <Card></Card>;

CreditsCard = withStyles(styles)(CreditsCard);

let PythonSDKCard = ({ classes }) => (
  <Card className={classes.cardRoot}>
    <CardContent>
      <Typography gutterBottom variant="h5" component="h2">
        API and Python SDK
      </Typography>
      <Typography
        gutterBottom
        variant="body2"
        color="textSecondary"
        component="p"
      >
        Generate an API Key from the <strong>Keys</strong> section to interact
        with our API using{" "}
        <a href="https://docs.dymaxionlabs.com/" target="_blank">
          Python
        </a>
        .
      </Typography>
      <Typography variant="body2" color="textSecondary" component="p">
        Check out the <strong>Tutorial</strong> in the Python SDK documentation,
        and this{" "}
        <a
          href="https://colab.research.google.com/drive/1LBME8Fn8n1WuWey4I3Icu8K9UWzOgj3i?usp=sharing"
          target="_blank"
        >
          Google Colaboratory notebook
        </a>
        .
      </Typography>
    </CardContent>
    <CardActions>
      <a
        href="https://docs.dymaxionlabs.com/en/latest/#tutorial"
        target="_blank"
        className={classes.anchor}
      >
        <Button size="small" color="primary">
          Tutorial
        </Button>
      </a>
    </CardActions>
  </Card>
);

PythonSDKCard = withStyles(styles)(PythonSDKCard);

class HomeContent extends React.Component {
  render() {
    const { t, classes } = this.props;
    const projectId = cookie.get("project");

    return (
      <div className={classes.root}>
        <Grid container spacing={3}>
          <Grid item xs={3}>
            <WelcomeCard />
          </Grid>
          <Grid item xs={3}>
            <PythonSDKCard />
          </Grid>
          <Grid item xs={6}>
            <WelcomeCard />
          </Grid>
          <Grid item xs={3}>
            <WelcomeCard />
          </Grid>
          <Grid item xs={3}>
            <WelcomeCard />
          </Grid>
          <Grid item xs={3}>
            <WelcomeCard />
          </Grid>
          <Grid item xs={3}>
            <WelcomeCard />
          </Grid>
        </Grid>
      </div>
    );
  }
}

HomeContent.propTypes = {
  classes: PropTypes.object.isRequired,
};

HomeContent = withStyles(styles)(HomeContent);
HomeContent = withTranslation("me")(HomeContent);

export default HomeContent;
