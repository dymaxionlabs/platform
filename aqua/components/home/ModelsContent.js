import { withStyles } from "@material-ui/core/styles";
import EditIcon from "@material-ui/icons/Edit";
import axios from "axios";
import cookie from "js-cookie";
import PropTypes from "prop-types";
import React from "react";
import Moment from "react-moment";
import { routerPush } from "../../utils/router";
import { i18n, withTranslation } from "../../i18n";
import { buildApiUrl } from "../../utils/api";
import { logout } from "../../utils/auth";
import { withSnackbar } from "notistack";
import ShowUuidDialog from "../ShowUuidDialog";
import ConfirmationDialog from "../ConfirmationDialog";

import {
  Paper,
  Table,
  TableBody,
  IconButton,
  Chip,
  Menu,
  MenuItem,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@material-ui/core";

const styles = (theme) => ({
  root: {
    width: "100%",
    overflowX: "auto",
  },
  table: {
    minWidth: 700,
  },
  title: {
    marginBottom: theme.spacing.units * 10,
  },
  modelBtn: {
    float: "right",
  },
  chip: {
    marginRight: theme.spacing(1),
  },
});

class ModelsContent extends React.Component {
  state = {
    loading: true,
    models: [],
    contextualMenuOpen: null,
    showUuidDialogOpen: false,
    deleteDialogOpen: false,
    currentUUID: "",
    beta: false,
  };

  async getModels() {
    const projectId = cookie.get("project");

    try {
      const response = await axios.get(buildApiUrl("/estimators/"), {
        params: { project: projectId },
        headers: { Authorization: this.props.token },
      });
      this.setState({
        models: response.data.results,
        deleteDialogOpen: false,
      });
    } catch (err) {
      const response = err.response;
      if (response && response.status === 401) {
        logout();
      } else {
        console.error(response);
        this.props.enqueueSnackbar("Failed to get models", {
          variant: "error",
        });
      }
    }
  }

  async getBetaFlag() {
    const { token } = this.props;
    try {
      const response = await axios.get(buildApiUrl("/auth/user/"), {
        headers: {
          "Accept-Language": i18n.language,
          Authorization: token,
        },
      });
      const userData = response.data;
      this.setState({ beta: userData.profile.beta });
    } catch (error) {
      console.error(error);
    }
  }

  async componentDidMount() {
    await this.getModels();
    await this.getBetaFlag();
    this.setState({ loading: false });
  }

  estimatorTypeName(model) {
    const { t } = this.props;
    return t(`models.types.${model.estimator_type}`);
  }

  handleContextualMenuClick = (event) => {
    this.setState({ contextualMenuOpen: event.currentTarget });
  };

  handleContextualMenuClose = () => {
    this.setState({ contextualMenuOpen: null });
  };

  onDialogResult = async (action) => {
    this.setState({
      showUuidDialogOpen: false,
      deleteDialogOpen: false,
      currentUUID: "",
    });
  };

  estimatorViewUUID = (model) => {
    this.setState({
      currentUUID: model.uuid,
      showUuidDialogOpen: true,
    });
  };

  estimatorDelete = (model) => {
    this.setState({
      currentUUID: model.uuid,
      deleteDialogOpen: true,
    });
  };

  onDeleteDialogResult = async (action) => {
    if (action) {
      const currentUUID = this.state.currentUUID;

      try {
        await axios.delete(buildApiUrl(`/estimators/${currentUUID}`), {
          headers: { Authorization: this.props.token },
        });
        this.props.enqueueSnackbar(`Model deleted`, {
          variant: "success",
        });
        this.getModels();
      } catch (error) {
        console.error(error);
        this.props.enqueueSnackbar(
          `Failed to delete model: ${JSON.stringify(error)}`,
          {
            variant: "error",
          }
        );
      }
    }
    this.setState({
      deleteDialogOpen: false,
    });
  };

  estimatorAddImages = (model) => {
    routerPush(`/models/new/od/upload?id=${model.uuid}`);
  };

  estimatorAddAnnotations = (model) => {
    routerPush(`/models/new/od/annotate?id=${model.uuid}`);
  };

  render() {
    const { t, classes } = this.props;
    const {
      models: models,
      contextualMenuOpen,
      showUuidDialogOpen,
      currentUUID,
      deleteDialogOpen,
    } = this.state;

    const locale = i18n.language;

    return (
      <div>
        <Typography
          className={classes.title}
          variant="h4"
          gutterBottom
          component="h2"
        >
          {t("models.title")}
        </Typography>
        <Paper className={classes.root}>
          <Table className={classes.table}>
            <TableHead>
              <TableRow>
                <TableCell>{t("models.name")}</TableCell>
                <TableCell>{t("models.estimator_type")}</TableCell>
                <TableCell>{t("models.classes")}</TableCell>
                <TableCell>{t("models.created_at")}</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {models.map((model, i) => (
                <TableRow key={i}>
                  <TableCell component="th" scope="row">
                    {model.name}
                  </TableCell>
                  <TableCell>{this.estimatorTypeName(model)}</TableCell>
                  <TableCell>
                    {model.classes.map((cls) => (
                      <Chip className={classes.chip} key={cls} label={cls} />
                    ))}
                  </TableCell>
                  <TableCell>
                    <Moment locale={locale} fromNow>
                      {model.created_at}
                    </Moment>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      className={classes.button}
                      aria-label="Edit"
                      aria-controls="simple-menu"
                      aria-haspopup="true"
                      onClick={this.handleContextualMenuClick}
                    >
                      <EditIcon />
                    </IconButton>
                    <Menu
                      id="edit-estimator-menu"
                      anchorEl={contextualMenuOpen}
                      keepMounted
                      open={Boolean(contextualMenuOpen)}
                      onClose={this.handleContextualMenuClose}
                    >
                      <MenuItem onClick={() => this.estimatorViewUUID(model)}>
                        {t("models.uuid")}
                      </MenuItem>
                      <MenuItem onClick={() => this.estimatorDelete(model)}>
                        {t("models.delete_models")}
                      </MenuItem>
                    </Menu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
        <ShowUuidDialog
          onClose={this.onDialogResult}
          open={showUuidDialogOpen}
          title={"UUID"}
          content={currentUUID}
        />
        <ConfirmationDialog
          onClose={this.onDeleteDialogResult}
          open={deleteDialogOpen}
          title={t("models.title_delete")}
          content={
            <div>
              <p>{t("models.text_delete")}</p>
              <p>
                <strong>{t("models.text_delete_warning")}</strong>
              </p>
            </div>
          }
        />
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
