import Button from "@material-ui/core/Button";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
// import CardMedia from "@material-ui/core/CardMedia";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import { withStyles } from "@material-ui/core/styles";
// import CardActionArea from "@material-ui/core/CardActionArea";
import Typography from "@material-ui/core/Typography";
import Head from "next/head";
import PropTypes from "prop-types";
import React from "react";
import BasicAppbar from "../../../components/BasicAppbar";
import ContactFormModalContent from "../../../components/home/ContactFormModalContent";
import { withNamespaces } from "../../../i18n";
import { withAuthSync } from "../../../utils/auth";
import { routerPush } from "../../../utils/router";

const styles = theme => ({
  main: {
    width: "auto",
    display: "block", // Fix IE 11 issue.
    marginLeft: theme.spacing.unit * 2,
    marginRight: theme.spacing.unit * 2,
    [theme.breakpoints.up(800 + theme.spacing.unit * 2 * 2)]: {
      width: 800,
      marginLeft: "auto",
      marginRight: "auto"
    }
  },
  header: {
    marginBottom: theme.spacing.unit * 3,
    textAlign: "center"
  },
  card: {
    width: "auto",
    display: "block", // Fix IE 11 issue.
    alignItems: "center",
    [theme.breakpoints.up(220 + theme.spacing.unit * 2 * 2)]: {
      width: 220,
      marginLeft: 18,
      marginTop: 15
    }
  },
  paper: {
    marginTop: theme.spacing.unit * 8,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justify: "evenly",
    padding: `${theme.spacing.unit * 2}px ${theme.spacing.unit * 3}px ${theme
      .spacing.unit * 3}px`
  }
});

class NewODModel extends React.Component {
  static async getInitialProps() {
    return {
      namespacesRequired: ["models"]
    };
  }

  state = {
    contactModalOpen: false
  };

  handleClick = type => {
    routerPush(`/models/new/${type}`);
  };

  handleClickOpen = () => {
    this.setState({ contactModalOpen: true });
  };

  handleContactModalClose = () => {
    this.setState({ contactModalOpen: false });
  };

  render() {
    const { t, token, classes } = this.props;
    const { contactModalOpen } = this.state;

    return (
      <React.Fragment>
        <Head>
          <title>{t("new_title")}</title>
        </Head>
        <BasicAppbar />
        <main className={classes.main}>
          <Paper className={classes.paper}>
            <Typography className={classes.header} component="h1" variant="h5">
              {t("new.header")}
            </Typography>
            <Typography variant="subtitle1">{t("new.explanation")}</Typography>
            <Grid container spacing={16}>
              <Grid item xs={12} sm={4}>
                <Card className={classes.card}>
                  {/* <CardActionArea>
                <CardMedia
                  onClick={() => this.handleClick("od")}
                  name="od"
                  component="img"
                  alt={t("object_btn")}
                  height="140"
                  image="/static/clasificacion.png"
                />
              </CardActionArea> */}
                  <CardActions>
                    <Button
                      color="primary"
                      fullWidth
                      onClick={() => this.handleClick("od")}
                    >
                      {t("object_btn")}
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Card className={classes.card}>
                  {/* <CardActionArea>
                <CardMedia
                  component="img"
                  alt={t("classification_btn")}
                  height="140"
                  image="/static/clasificacion.png"
                  onClick={this.handleClickOpen}
                />
              </CardActionArea> */}
                  <CardActions>
                    <Button
                      color="primary"
                      fullWidth
                      onClick={this.handleClickOpen}
                    >
                      {t("classification_btn")}
                    </Button>
                    <ContactFormModalContent
                      open={contactModalOpen}
                      onClose={this.handleContactModalClose}
                      token={token}
                    />
                  </CardActions>
                </Card>
              </Grid>
              <Grid item xs={12} sm={2}>
                <Card className={classes.card}>
                  {/* <CardActionArea>
                <CardMedia
                  component="img"
                  alt={t("segmentation_btn")}
                  height="140"
                  image="/static/clasificacion.png"
                  onClick={this.handleClickOpen}
                />
              </CardActionArea> */}
                  <CardActions>
                    <Button
                      color="primary"
                      fullWidth
                      onClick={this.handleClickOpen}
                    >
                      {t("change_detection_btn")}
                    </Button>
                    <ContactFormModalContent
                      open={contactModalOpen}
                      onClose={this.handleContactModalClose}
                      token={token}
                    />
                  </CardActions>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </main>
      </React.Fragment>
    );
  }
}

NewODModel.propTypes = {
  classes: PropTypes.object.isRequired
};

NewODModel = withStyles(styles)(NewODModel);
NewODModel = withNamespaces("models")(NewODModel);
NewODModel = withAuthSync(NewODModel);

export default NewODModel;
