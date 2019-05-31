import Button from "@material-ui/core/Button";
import Paper from "@material-ui/core/Paper";
import { withStyles } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import IconButton from "@material-ui/core/IconButton";
import Chip from "@material-ui/core/Chip";
import AddToPhotosIcon from "@material-ui/icons/AddToPhotos";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Typography from "@material-ui/core/Typography";
import axios from "axios";
import cookie from "js-cookie";
import PropTypes from "prop-types";
import React from "react";
import Moment from "react-moment";
import { i18n, Link, withNamespaces } from "../../i18n";
import { buildApiUrl } from "../../utils/api";
import { logout } from "../../utils/auth";

const styles = theme => ({
  root: {
    width: "100%",
    overflowX: "auto"
  },
  table: {
    minWidth: 700
  },
  title: {
    marginBottom: theme.spacing.units * 10
  },
  modelBtn: {
    float: "right"
  },
  chip: {
    marginRight: theme.spacing.unit
  }
});

let NewModelButton = ({ t, className }) => (
  <Link href="/models/new">
    <Button className={className}>{t("models.new_btn")}</Button>
  </Link>
);

NewModelButton = withNamespaces("me")(NewModelButton);

class ModelsContent extends React.Component {
  state = {
    models: []
  };

  componentDidMount() {
    const projectId = cookie.get("project");

    axios
      .get(buildApiUrl("/estimators/"), {
        params: { project_uuid: projectId },
        headers: { Authorization: this.props.token }
      })
      .then(response => {
        this.setState({ models: response.data.results });
      })
      .catch(err => {
        const response = err.response;
        if (response && response.status === 401) {
          logout();
        } else {
          console.error(response);
        }
      });
  }

  estimatorTypeName(model) {
    const { t } = this.props;
    return t(`models.types.${model.estimator_type}`);
  }

  render() {
    const { t, classes } = this.props;
    const { models: models } = this.state;
    const locale = i18n.language;

    return (
      <div>
        <Typography
          className={classes.title}
          variant="h4"
          gutterBottom
          component="h2"
        >
          <NewModelButton className={classes.modelBtn} />
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
                {/* <TableCell /> */}
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
                    {model.classes.map(cls => (
                      <Chip className={classes.chip} key={cls} label={cls} />
                    ))}
                  </TableCell>
                  <TableCell>
                    <Moment locale={locale} fromNow>
                      {model.created_at}
                    </Moment>
                  </TableCell>
                  {/* <TableCell align="right">
                    <a href={`/models/upload-images/${model.uuid}`}>
                      <IconButton
                        className={classes.button}
                        aria-label="Upload images"
                      >
                        <AddToPhotosIcon />
                      </IconButton>
                    </a>
                  </TableCell> */}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      </div>
    );
  }
}

ModelsContent.propTypes = {
  classes: PropTypes.object.isRequired
};

ModelsContent = withStyles(styles)(ModelsContent);
ModelsContent = withNamespaces("me")(ModelsContent);

export default ModelsContent;
