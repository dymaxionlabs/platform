import Paper from "@material-ui/core/Paper";
import { withStyles } from "@material-ui/core/styles";
import Head from "next/head";
import PropTypes from "prop-types";
import React from "react";
import BasicAppbar from "../../../components/BasicAppbar";
import InitialStep from "../../../components/models/new/od/InitialStep";
import CreateStep from "../../../components/models/new/od/CreateStep";
import UploadStep from "../../../components/models/new/od/UploadStep";
import { withNamespaces } from "../../../i18n";
import { withAuthSync } from "../../../utils/auth";

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

const steps = ["initial", "create", "upload", "annotate", "test", "improve"];

class NewODModel extends React.Component {
  state = {
    step: "initial"
  };

  static async getInitialProps({ query }) {
    return {
      namespacesRequired: ["models"],
      query: query
    };
  }

  constructor(props) {
    super(props);

    const { step } = props.query;

    // Set current step based on path
    if (step && steps.includes(step)) {
      this.state.step = step;
    }
  }

  stepContent() {
    const { token, query } = this.props;
    const { step } = this.state;

    switch (step) {
      case "initial": {
        return <InitialStep token={token} />;
      }
      case "create": {
        return <CreateStep token={token} />;
      }
      case "upload": {
        return <UploadStep token={token} estimatorId={query.id} />;
      }
    }
  }

  render() {
    const { t, classes } = this.props;

    return (
      <div>
        <Head>
          <title>{t("new.od.header")}</title>
        </Head>
        <BasicAppbar />
        <main className={classes.main}>
          <Paper className={classes.paper}>{this.stepContent()}</Paper>
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
