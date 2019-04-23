import axios from "axios";
import Head from "next/head";
import React from "react";
import BasicAppbar from "../../../components/BasicAppbar";
import StepperContent from "../../../components/home/StepperContent";
import AnnotateStep from "../../../components/models/new/od/AnnotateStep";
import CreateStep from "../../../components/models/new/od/CreateStep";
import InitialStep from "../../../components/models/new/od/InitialStep";
import UploadStep from "../../../components/models/new/od/UploadStep";
import { i18n, withNamespaces } from "../../../i18n";
import { buildApiUrl } from "../../../utils/api";
import { withAuthSync } from "../../../utils/auth";
import { routerReplace } from "../../../utils/router";

const steps = ["initial", "create", "upload", "annotate", "test", "improve"];

class NewODModel extends React.Component {
  state = {
    step: steps[0]
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

  componentDidMount() {
    const { token, query } = this.props;

    if (query.id) {
      axios
        .head(buildApiUrl(`/estimators/${query.id}`), {
          headers: {
            Authorization: token,
            "Accept-Language": i18n.language
          }
        })
        .catch(() => {
          console.log("Invalid estimator id. Redirecting...");
          routerReplace(`/models/new/od`);
        });
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
      case "annotate": {
        return <AnnotateStep token={token} estimatorId={query.id} />;
      }
    }
  }

  render() {
    const { t } = this.props;
    return (
      <>
        <Head>
          <title>{t("new.od.header")}</title>
        </Head>
        <BasicAppbar />
        {this.stepContent()}
        <br />
        <StepperContent activeStep={this.state.step} steps={steps} />
      </>
    );
  }
}

NewODModel = withNamespaces("models")(NewODModel);
NewODModel = withAuthSync(NewODModel);

export default NewODModel;
