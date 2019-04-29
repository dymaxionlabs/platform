import Button from "@material-ui/core/Button";
import Paper from "@material-ui/core/Paper";
import { withStyles } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
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
  estimatorBtn: {
    float: "right"
  }
});

let NewEstimatorButton = ({ t, ...props }) => (
  <Link href="/models/new">
    <Button {...props}>{t("estimators.new_btn")}</Button>
  </Link>
);

NewEstimatorButton = withNamespaces("me")(NewEstimatorButton);

class EstimatorsContent extends React.Component {
  state = {
    estimators: []
  };

  componentDidMount() {
    const projectId = cookie.get("project");

    axios
      .get(buildApiUrl("/estimators/"), {
        params: { project_uuid: projectId },
        headers: { Authorization: this.props.token }
      })
      .then(response => {
        this.setState({ estimators: response.data.results });
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

  render() {
    const { t, classes } = this.props;
    const { estimators: estimators } = this.state;
    const locale = i18n.language;

    return (
      <div>
        <Typography
          className={classes.title}
          variant="h4"
          gutterBottom
          component="h2"
        >
          <NewEstimatorButton className={classes.estimatorBtn} />
          {t("estimators.title")}
        </Typography>
        <Paper className={classes.root}>
          <Table className={classes.table}>
            <TableHead>
              <TableRow>
                <TableCell>{t("estimators.name")}</TableCell>
                <TableCell>{t("estimators.type")}</TableCell>
                <TableCell>{t("estimators.created_at")}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {estimators.map((estimators, i) => (
                <TableRow key={i}>
                  <TableCell component="th" scope="row">
                    {estimators.name}
                  </TableCell>
                  <TableCell>
                    <Moment locale={locale} fromNow>
                      {estimators.type}
                    </Moment>
                  </TableCell>
                  <TableCell>
                    <Moment locale={locale} fromNow>
                      {estimators.created_at}
                    </Moment>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      </div>
    );
  }
}

EstimatorsContent.propTypes = {
  classes: PropTypes.object.isRequired
};

EstimatorsContent = withStyles(styles)(EstimatorsContent);
EstimatorsContent = withNamespaces("me")(EstimatorsContent);

export default EstimatorsContent;
