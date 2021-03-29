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
import cookie from "js-cookie";
import { withSnackbar } from "notistack";
import PropTypes from "prop-types";
import React from "react";
import Moment from "react-moment";
import TableRowSkeleton from "../TableRowSkeleton";
import { Link, i18n } from "../../i18n";
import { buildApiUrl } from "../../utils/api";
import { logout } from "../../utils/auth";

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

const DashboardList = withStyles(styles)(({ classes, items, loading, locale }) => (
  <Table className={classes.table}>
    <TableHead>
      <TableRow>
        <TableCell>Name</TableCell>
        <TableCell>Created at</TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {loading && <TableRowSkeleton cols={2} />}
      {!loading && items.length === 0 && (
        <TableRow>
          <TableCell>There are no dashboards.</TableCell>
        </TableRow>
      )}
      {items.map((item) => (
        <TableRow key={item.id}>
          <TableCell component="th" scope="row">
            <Link href={`/home/dashboards/${item.id}/`}><a>{item.name}</a></Link>
          </TableCell>
          <TableCell>
            <Moment locale={locale} fromNow>
              {item.created_at}
            </Moment>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
))

const Dashboard = ({ item }) => (<iframe
  style={{ border: "none", width: "100%", height: "75vh" }}
  src={item.url}
></iframe>)

class DashboardsContent extends React.Component {
  state = {
    loading: true,
    items: [],
  };

  async getItems() {
    console.log("getItems");

    const projectId = cookie.get("project");

    try {
      const response = await axios.get(buildApiUrl("/dashboards/"), {
        params: { project: projectId },
        headers: { Authorization: this.props.token },
      });
      this.setState({
        items: response.data.results,
      });
    } catch (err) {
      const response = err.response;
      if (response && response.status === 401) {
        logout();
      } else {
        console.error(response);
        this.props.enqueueSnackbar("Failed to get dashboards", {
          variant: "error",
        });
      }
    }
  }

  async getItem(id) {
    console.log("getItem")

    const projectId = cookie.get("project");

    try {
      const response = await axios.get(buildApiUrl(`/dashboards/${id}/`), {
        params: { project: projectId },
        headers: { Authorization: this.props.token },
      });
      // console.log(response.data);
      this.setState({
        item: response.data,
      });
    } catch (err) {
      const response = err.response;
      if (response && response.status === 401) {
        logout();
      } else {
        console.error(response);
        this.props.enqueueSnackbar("Failed to get dashboard", {
          variant: "error",
        });
      }
    }
  }

  async componentDidMount() {
    const { id } = this.props;
    if (typeof id === 'undefined') {
      await this.getItems();
    } else {
      await this.getItem(id);
    }
    this.setState({ loading: false });
  }

  render() {
    const { classes } = this.props;
    const {
      loading,
      item,
      items,
    } = this.state;

    return (
      <div>
        <Typography variant="h6" gutterBottom component="h2">
          {item ? item.name : "Dashboards"}
        </Typography>
        <Paper className={classes.root}>
          {item ?
            <Dashboard item={item} /> :
            <DashboardList items={items} loading={loading} locale={i18n.language} />}
        </Paper>
      </div>
    );
  }
}

DashboardsContent.propTypes = {
  classes: PropTypes.object.isRequired,
};

DashboardsContent = withStyles(styles)(DashboardsContent);
DashboardsContent = withSnackbar(DashboardsContent);

export default DashboardsContent;
