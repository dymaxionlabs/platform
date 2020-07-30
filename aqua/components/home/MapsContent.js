import {
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";
import MapIcon from "@material-ui/icons/Map";
import axios from "axios";
import cookie from "js-cookie";
import { withSnackbar } from "notistack";
import PropTypes from "prop-types";
import React from "react";
import Moment from "react-moment";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import { i18n, withTranslation } from "../../i18n";
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
});

function getMapId(layer) {
  const parts = layer.url.split("/");
  return parts[parts.length - 2];
}

class MapsContent extends React.Component {
  state = {
    loading: true,
    maps: [],
  };

  async componentDidMount() {
    await this.getMaps();
    this.setState({ loading: false });
  }

  async getMaps() {
    const projectId = cookie.get("project");

    try {
      const response = await axios.get(buildApiUrl("/maps/"), {
        params: { project: projectId },
        headers: { Authorization: this.props.token },
      });
      this.setState({ maps: response.data.results });
    } catch (err) {
      const response = err.response;
      if (response && response.status === 401) {
        logout();
      } else {
        console.error(response);
        this.props.enqueueSnackbar("Failed to get maps", {
          variant: "error",
        });
      }
    }
  }

  render() {
    const { t, classes } = this.props;
    const { loading, maps } = this.state;
    const locale = i18n.language;

    return (
      <div>
        <Typography variant="h6" gutterBottom component="h2">
          {t("maps.title")}
        </Typography>
        <Paper className={classes.root}>
          <Table className={classes.table}>
            <TableHead>
              <TableRow>
                <TableCell>{t("maps.created_at")}</TableCell>
                <TableCell>{t("maps.name")}</TableCell>
                <TableCell>{t("maps.description")}</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {loading && <TableRowSkeleton cols={3} />}
              {!loading && maps.length === 0 && (
                <TableRow>
                  <TableCell>There are no maps.</TableCell>
                </TableRow>
              )}
              {maps.map((map, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Moment locale={locale} fromNow>
                      {map.created_at}
                    </Moment>
                  </TableCell>
                  <TableCell component="th" scope="row">
                    {map.name}
                  </TableCell>
                  <TableCell>{map.description}</TableCell>
                  <TableCell align="right">
                    <a href={`/maps/${map.uuid}`}>
                      <IconButton
                        className={classes.button}
                        aria-label="View map"
                      >
                        <MapIcon />
                      </IconButton>
                    </a>
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

MapsContent.propTypes = {
  classes: PropTypes.object.isRequired,
};

MapsContent = withStyles(styles)(MapsContent);
MapsContent = withTranslation("me")(MapsContent);
MapsContent = withSnackbar(MapsContent);

export default MapsContent;
