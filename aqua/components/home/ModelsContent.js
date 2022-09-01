import { Typography } from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";
import { withSnackbar } from "notistack";
import PropTypes from "prop-types";
import React from "react";
import { withTranslation } from "../../i18n";
import { ModelsGallery } from "../ModelsGallery";

const styles = (theme) => ({
  root: {
    width: "100%",
    overflowX: "auto",
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(3),
  },
  table: {
    minWidth: 700,
  },
  modelBtn: {
    float: "right",
  },
  chip: {
    marginRight: theme.spacing(1),
  },
});

class ModelsContent extends React.Component {
  render() {
    const { t } = this.props;

    return (
      <div>
        <Typography variant="h6" gutterBottom component="h2">
          {t("models.title")}
        </Typography>
        <ModelsGallery token={this.props.token} />
      </div>
    );
  }
}

ModelsContent.propTypes = {
  classes: PropTypes.object.isRequired,
};

ModelsContent = withStyles(styles)(ModelsContent);
ModelsContent = withTranslation("me")(ModelsContent);
ModelsContent = withSnackbar(ModelsContent);

export default ModelsContent;
