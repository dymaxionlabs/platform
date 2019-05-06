import Head from "next/head";
import React from "react";
import BasicAppbar from "../../../components/BasicAppbar";
import AnnotateStep from "../../../components/models/new/od/AnnotateStep";
import CreateStep from "../../../components/models/new/od/CreateStep";
import InitialStep from "../../../components/models/new/od/InitialStep";
import UploadStep from "../../../components/models/new/od/UploadStep";
import { withNamespaces } from "../../../i18n";
import { withAuthSync } from "../../../utils/auth";

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
      </>
    );
  }
}

NewODModel = withNamespaces("models")(NewODModel);
NewODModel = withAuthSync(NewODModel);

export default NewODModel;
