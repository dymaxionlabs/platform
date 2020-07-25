import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";
import axios from "axios";
import { withSnackbar } from "notistack";
import PropTypes from "prop-types";
import React from "react";
import Moment from "react-moment";
import { i18n, withTranslation } from "../../i18n";
import { buildApiUrl } from "../../utils/api";
import { logout } from "../../utils/auth";
import TableRowSkeleton from "../TableRowSkeleton";

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
});

class CreditsContent extends React.Component {
  state = {
    loading: true,
    availableCredits: 0,
    entries: [],
  };

  async componentDidMount() {
    await this.getAvailable();
    await this.getLogEntries();
    this.setState({ loading: false });
  }

  async getAvailable() {
    try {
      const response = await axios.get(buildApiUrl("/credits/available/"), {
        headers: { Authorization: this.props.token },
      });
      console.log(response.data);
      this.setState({
        availableCredits: response.data.available,
      });
    } catch (err) {
      const response = err.response;
      if (response && response.status === 401) {
        logout();
      } else {
        console.error(response);
        this.props.enqueueSnackbar("Failed to get available credits", {
          variant: "error",
        });
      }
    }
  }

  async getLogEntries() {
    try {
      const response = await axios.get(buildApiUrl("/credits/log/"), {
        headers: { Authorization: this.props.token },
      });
      this.setState({
        entries: response.data.results,
      });
    } catch (err) {
      const response = err.response;
      if (response && response.status === 401) {
        logout();
      } else {
        console.error(response);
        this.props.enqueueSnackbar("Failed to get transactions", {
          variant: "error",
        });
      }
    }
  }

  render() {
    const { t, classes } = this.props;
    const { loading, availableCredits, entries } = this.state;

    const locale = i18n.language;

    return (
      <div>
        <Typography variant="h6" gutterBottom component="h3">
          Credit Management
        </Typography>
        <Paper className={classes.availableCredits}>
          <Typography variant="h6" gutterBottom component="h4">
            Available credits
          </Typography>
          <Typography variant="h6" gutterBottom component="h4">
            {availableCredits}
          </Typography>
        </Paper>
        <Typography variant="h6" gutterBottom component="h3">
          Transactions
        </Typography>
        <Paper className={classes.root}>
          <Table className={classes.table}>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Credits</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading && <TableRowSkeleton cols={4} />}
              {!loading && entries.length === 0 && (
                <TableRow>
                  <TableCell>There are no transactions.</TableCell>
                </TableRow>
              )}
              {entries.map((entry, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Moment locale={locale} format="LLLL">
                      {entry.datetime}
                    </Moment>
                  </TableCell>
                  <TableCell>{t(`credits.kinds.${entry.kind}`)}</TableCell>
                  <TableCell>{entry.description}</TableCell>
                  <TableCell>{entry.value}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      </div>
    );
  }
}

CreditsContent.propTypes = {
  classes: PropTypes.object.isRequired,
};

CreditsContent = withStyles(styles)(CreditsContent);
CreditsContent = withTranslation("me")(CreditsContent);
CreditsContent = withSnackbar(CreditsContent);

export default CreditsContent;
