import Button from "@material-ui/core/Button";
import Card from "@material-ui/core/Card";
import CardActionArea from "@material-ui/core/CardActionArea";
import CardActions from "@material-ui/core/CardActions";
import CardMedia from "@material-ui/core/CardMedia";
import Grid from "@material-ui/core/Grid";
import { withStyles } from "@material-ui/core/styles";
import Head from "next/head";
import PropTypes from "prop-types";
import React from "react";
import BasicAppbar from "../../../components/BasicAppbar";
import ContactFormModalContent from "../../../components/home/ContactFormModalContent";
import { Link, withNamespaces } from "../../../i18n";
import { withAuthSync } from "../../../utils/auth";

const styles = theme => ({
  card: {
    width: "auto",
    display: "block", // Fix IE 11 issue.
    alignItems: "center",
    [theme.breakpoints.up(400 + theme.spacing.unit * 2 * 2)]: {
      width: 400,
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
  constructor(props) {
    super(props);
    this.handleClickOpen = this.handleClickOpen.bind(this);
  }

  static async getInitialProps() {
    return {
      namespacesRequired: ["models"]
    };
  }

  state = {
    spacing: "16",
    open: false
  };

  handleClickOpen = () => {
    this.setState({ open: true });
  };

  handleClose = () => {
    this.setState({ open: false });
    this.setState({
      errorMsg: "",
      successMsg: "",
      isSubmitting: false
    });
  };

  render() {
    const { t, classes } = this.props;
    return (
      <div>
        <Head>
          <title>{t("new_title")}</title>
        </Head>
        <BasicAppbar />
        <Grid container spacing={12}>
          <Grid item xs={12} sm={4}>
            <Card className={classes.card}>
              <CardActionArea>
                <Link href="new/od/">
                  <CardMedia
                    component="img"
                    alt={t("object_btn")}
                    className={classes.paper}
                    height="140"
                    image="/static/clasificacion.png"
                  />
                </Link>
              </CardActionArea>
              <CardActions>
                <Link href="new/od/">
                  <Button size="small" color="primary">
                    {t("object_btn")}
                  </Button>
                </Link>
              </CardActions>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card className={classes.card}>
              <CardActionArea>
                <CardMedia
                  component="img"
                  alt={t("classification_btn")}
                  className={classes.paper}
                  height="140"
                  image="/static/clasificacion.png"
                  onClick={this.handleClickOpen}
                />
              </CardActionArea>
              <CardActions>
                <Button
                  size="small"
                  color="primary"
                  onClick={this.handleClickOpen}
                >
                  {t("classification_btn")}
                </Button>
                <ContactFormModalContent
                  open={this.state.open}
                  datos={this.props}
                  handleClose={this.handleClose}
                />
              </CardActions>
            </Card>
          </Grid>
          <Grid item xs={12} sm={2}>
            <Card className={classes.card}>
              <CardActionArea>
                <CardMedia
                  component="img"
                  alt={t("segmentation_btn")}
                  className={classes.paper}
                  height="140"
                  image="/static/clasificacion.png"
                  onClick={this.handleClickOpen}
                />
              </CardActionArea>
              <CardActions>
                <Button
                  size="small"
                  color="primary"
                  onClick={this.handleClickOpen}
                >
                  {t("segmentation_btn")}
                </Button>
                <ContactFormModalContent
                  open={this.state.open}
                  datos={this.props}
                  handleClose={this.handleClose}
                />
              </CardActions>
            </Card>
          </Grid>
          <Grid item xs={12} sm={5}>
            <Card className={classes.card}>
              <CardActionArea>
                <CardMedia
                  component="img"
                  alt={t("others_btn")}
                  className={classes.paper}
                  height="140"
                  image="/static/clasificacion.png"
                  onClick={this.handleClickOpen}
                />
              </CardActionArea>
              <CardActions>
                <Button
                  size="small"
                  color="primary"
                  onClick={this.handleClickOpen}
                >
                  {t("others_btn")}
                </Button>
                <ContactFormModalContent
                  open={this.state.open}
                  datos={this.props}
                  handleClose={this.handleClose}
                />
              </CardActions>
            </Card>
          </Grid>
        </Grid>
      </div>
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
