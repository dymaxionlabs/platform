import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  LinearProgress,
} from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";
import axios from "axios";
import cookie from "js-cookie";
import { withSnackbar } from "notistack";
import PropTypes from "prop-types";
import React from "react";
import Moment from "react-moment";
import { i18n, withTranslation } from "../../i18n";
import { buildApiUrl } from "../../utils/api";
import { logout } from "../../utils/auth";
import TableRowSkeleton from "../TableRowSkeleton";
import moment from "moment";

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
});

const TaskProgress = ({ task }) => {
  const duration = task.duration || task.estimated_duration;
  if (duration) {
    const created_at = moment(task.created_at);
    const progressSeconds = moment().diff(created_at, "seconds");
    console.log("progress in seconds:", progressSeconds);
    const progress = Math.min(
      Math.round((progressSeconds / duration) * 100),
      100
    );
    console.log("progress %", progress);
    return <LinearProgress variant="determinate" value={progress} />;
  } else {
    return <LinearProgress />;
  }
};

class TasksContent extends React.Component {
  state = {
    loading: true,
    tasks: [],
  };

  async componentDidMount() {
    await this.getTasks();
    this.setState({ loading: false });

    setInterval(() => this.getTasks(), 5000);
  }

  async getTasks() {
    const projectId = cookie.get("project");

    try {
      const response = await axios.get(buildApiUrl("/tasks/"), {
        params: { project: projectId },
        headers: { Authorization: this.props.token },
      });
      this.setState({
        tasks: response.data.results,
      });
    } catch (err) {
      const response = err.response;
      if (response && response.status === 401) {
        logout();
      } else {
        console.error(response);
        this.props.enqueueSnackbar("Failed to get tasks", {
          variant: "error",
        });
      }
    }
  }

  render() {
    const { t, classes } = this.props;
    const { loading, tasks } = this.state;

    const locale = i18n.language;

    return (
      <div>
        <Typography
          className={classes.title}
          variant="h4"
          gutterBottom
          component="h2"
        >
          Tasks
        </Typography>
        <Paper className={classes.root}>
          <Table className={classes.table}>
            <TableHead>
              <TableRow>
                <TableCell>Id</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>State</TableCell>
                <TableCell>Progress</TableCell>
                <TableCell>Created at</TableCell>
                <TableCell>Finished at</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading && <TableRowSkeleton cols={6} />}
              {!loading && tasks.length === 0 && (
                <TableRow>
                  <TableCell>There are no tasks.</TableCell>
                </TableRow>
              )}
              {tasks.map((task, i) => (
                <TableRow key={i}>
                  <TableCell>{task.id}</TableCell>
                  <TableCell>{task.name}</TableCell>
                  <TableCell>{t(`tasks.states.${task.state}`)}</TableCell>
                  <TableCell>
                    <TaskProgress task={task} />
                  </TableCell>
                  <TableCell>
                    <Moment locale={locale} fromNow>
                      {task.created_at}
                    </Moment>
                  </TableCell>
                  <TableCell>
                    <Moment locale={locale} fromNow>
                      {task.finished_at}
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

TasksContent.propTypes = {
  classes: PropTypes.object.isRequired,
};

TasksContent = withStyles(styles)(TasksContent);
TasksContent = withTranslation("me")(TasksContent);
TasksContent = withSnackbar(TasksContent);

export default TasksContent;
