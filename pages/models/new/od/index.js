import Button from "@material-ui/core/Button";
import Paper from "@material-ui/core/Paper";
import { withStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Head from "next/head";
import PropTypes from "prop-types";
import React from "react";
import BasicAppbar from "../../../../components/BasicAppbar";
import { Link, withNamespaces } from "../../../../i18n";
import { withAuthSync } from "../../../../utils/auth";

const styles = theme => ({
  main: {
    width: "auto",
    display: "block", // Fix IE 11 issue.
    marginLeft: theme.spacing.unit * 2,
    marginRight: theme.spacing.unit * 2,
    [theme.breakpoints.up(500 + theme.spacing.unit * 2 * 2)]: {
      width: 500,
      marginLeft: "auto",
      marginRight: "auto"
    }
  },
  paper: {
    marginTop: theme.spacing.unit * 8,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: `${theme.spacing.unit * 2}px ${theme.spacing.unit * 3}px ${theme
      .spacing.unit * 3}px`
  }
});

class NewODModel extends React.Component {
  static async getInitialProps(ctx) {
    return {
      namespacesRequired: ["models"]
    };
  }

  render() {
    const { t, classes } = this.props;

    return (
      <div>
        <Head>
          <title>{t("new.od.title")}</title>
        </Head>
        <BasicAppbar />
        <main className={classes.main}>
          <Paper className={classes.paper}>
            <Typography className={classes.header} component="h1" variant="h5">
              {t("new.od.header")}
            </Typography>
            <Link href="/models/new/od/create">
              <Button color="primary">Start building</Button>
            </Link>
          </Paper>
        </main>
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
