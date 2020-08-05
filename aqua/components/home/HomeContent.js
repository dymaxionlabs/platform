import {
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  Grid,
  LinearProgress,
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
import PropTypes from "prop-types";
import React, { Fragment } from "react";
import Moment from "react-moment";
import { i18n, withTranslation, Link } from "../../i18n";
import { buildApiUrl } from "../../utils/api";
import { formatBytes } from "../../utils/utils";


function LinearProgressWithLabel(props) {
  return (
    <Box display="flex" alignItems="center">
      <Box width="75%" mr={2}>
        <LinearProgress {...props} />
      </Box>
      <Box width="25%" minWidth={35}>
        <Typography variant="body2" color="textSecondary">{
          `[${props.used}/${props.total}]`
        }</Typography>
      </Box>
    </Box>
  );
}
const BorderLinearProgress = withStyles((theme) => ({
  root: {
    height: 10,
    borderRadius: 5,
  },
  colorPrimary: {
    backgroundColor: theme.palette.grey[theme.palette.type === 'light' ? 200 : 700],
  },
  bar: {
    borderRadius: 5,
    backgroundColor: '#1a90ff',
  },
}))(LinearProgressWithLabel);


const styles = (theme) => ({
  root: {
    flexGrow: 1,
  },
  availableCreditsNumber: {
    fontSize: "1.5rem",
    fontWeight: 500,
  },
  textTruncate: {
    lineHeight: '0.5rem',
    width: "50px",
    maxWidth: "30%",
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  tableHeight: {
    lineHeight: '0.5rem'
  },
});

let WelcomeCard = ({ classes }) => (
  <Card className={classes.cardRoot}>
    <CardContent>
      <Typography gutterBottom variant="h5" component="h2">
        Welcome to Dymaxion Labs Platform
      </Typography>
      <Typography variant="body2" color="textSecondary" component="p">
        If this is your first time here, we recommend you to do a{" "}
        <strong>Test Drive</strong> to understand what you can achieve with our{" "}
        <strong>Models</strong> application.
      </Typography>
    </CardContent>
    <CardActions>
      <Link href="/testdrive">
        <Button size="small" color="primary">
          Test Drive
        </Button>
      </Link>
    </CardActions>
  </Card>
);

WelcomeCard = withStyles(styles)(WelcomeCard);

let CreditsCard = ({ classes, availableCredits }) => (
  <Card className={classes.cardRoot}>
    <CardContent>
      <Typography gutterBottom variant="h5" component="h2">
      Available credits
      </Typography>
      <Typography className={classes.availableCreditsNumber}>
        {availableCredits && availableCredits.toLocaleString()}
      </Typography>
    </CardContent>
    <CardActions>
      <Link href="/home/credits">
        <Button size="small" color="primary">
          Credits
        </Button>
      </Link>
    </CardActions>
  </Card>
  );

CreditsCard = withStyles(styles)(CreditsCard);

let PythonSDKCard = ({ classes }) => (
  <Card className={classes.cardRoot}>
    <CardContent>
      <Typography gutterBottom variant="h5" component="h2">
        API and Python SDK
      </Typography>
      <Typography
        gutterBottom
        variant="body2"
        color="textSecondary"
        component="p"
      >
        Generate an API Key from the <strong>Keys</strong> section to interact
        with our API using{" "}
        <a href="https://docs.dymaxionlabs.com/" target="_blank">
          Python
        </a>
        .
      </Typography>
      <Typography variant="body2" color="textSecondary" component="p">
        Check out the <strong>Tutorial</strong> in the Python SDK documentation,
        and this{" "}
        <a
          href="https://colab.research.google.com/drive/1LBME8Fn8n1WuWey4I3Icu8K9UWzOgj3i?usp=sharing"
          target="_blank"
        >
          Google Colaboratory notebook
        </a>
        .
      </Typography>
    </CardContent>
    <CardActions>
      <a
        href="https://docs.dymaxionlabs.com/en/latest/#tutorial"
        target="_blank"
        className={classes.anchor}
      >
        <Button size="small" color="primary">
          Tutorial
        </Button>
      </a>
    </CardActions>
  </Card>
);

PythonSDKCard = withStyles(styles)(PythonSDKCard);

let TasksCard = ({ classes, tasks, t, locale }) => (
  <Card className={classes.cardRoot}>
    <CardContent>
      <Typography gutterBottom variant="h5" component="h2">
        Tasks
      </Typography>
      <Paper className={classes.root}>
          <Table className={classes.table}>
            <TableHead>
              <TableRow>
                <TableCell className={classes.tableHeight}>Id</TableCell>
                <TableCell className={classes.textTruncate}>Name</TableCell>
                <TableCell className={classes.tableHeight}>State</TableCell>
                <TableCell className={classes.tableHeight}>Started at</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tasks.length === 0 && (
                <TableRow>
                  <TableCell className={classes.tableHeight}>There are tasks.</TableCell>
                </TableRow>
              )}
              {tasks.map((task, i) => (
                <TableRow key={i}>
                  <TableCell className={classes.tableHeight}>{task.id}</TableCell>
                  <TableCell className={classes.textTruncate}>{task.name}</TableCell>
                  <TableCell className={classes.tableHeight}>{t(`tasks.states.${task.state}`)}</TableCell>
                  <TableCell className={classes.tableHeight}>
                    <Moment locale={locale} fromNow>
                      {task.created_at}
                    </Moment>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
    </CardContent>
    <CardActions>
      <Link href="/home/tasks">
        <Button size="small" color="primary">
          Show more
        </Button>
      </Link>
    </CardActions>
  </Card>
)

TasksCard = withStyles(styles)(TasksCard);

let UsageCard = ({ classes, storageUsage, projectData }) => (
  <Card className={classes.cardRoot}>
    <CardContent>
      <Typography gutterBottom variant="h5" component="h2">
        User Storage
      </Typography>
      { storageUsage && 
        <BorderLinearProgress   
          variant="determinate" 
          value={storageUsage.used * 100 / storageUsage.available} 
          used={formatBytes(storageUsage.used)} 
          total={formatBytes(storageUsage.available)}
        />
      }
      { projectData && 
        (<Fragment>
          <Typography gutterBottom variant="h5" component="h2">
            Project: {projectData.name}
          </Typography>
          <Typography gutterBottom variant="body2" color="textSecondary" component="p">
            Estimators: {projectData.estimators.count} / {projectData.estimators.limit}
          </Typography>
          <Typography gutterBottom variant="body2" color="textSecondary" component="p">
            Tasks: {projectData.tasks}
          </Typography>
          <Typography gutterBottom variant="body2" color="textSecondary" component="p">
            Files: {projectData.files}
          </Typography>
        </Fragment>)
      }
    </CardContent>
  </Card>
  );

  UsageCard = withStyles(styles)(UsageCard);

class HomeContent extends React.Component {
  state = {
    availableCredits: null,
    storageUsage: null,
    projectData: null,
    latestTasks: [],
  };

  async componentDidMount() {
    await this.getAvailableCredit();
    await this.getUserUsage();
    await this.getLatestTasks();
  }

  async getAvailableCredit() {
    try {
      const response = await axios.get(buildApiUrl("/credits/available/"), {
        headers: { Authorization: this.props.token },
      });
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

  async getUserUsage() {
    const projectId = cookie.get("project");
    try {
      const response = await axios.get(buildApiUrl(`/quotas/usage/?project=${projectId}`), {
        headers: { Authorization: this.props.token },
      });
      this.setState({
        storageUsage: response.data.user.storage,
        projectData: response.data.projects.filter(p => p.uuid === projectId)[0]
      });
    } catch (err) {
      const response = err.response;
      if (response && response.status === 401) {
        logout();
      } else {
        console.error(response);
        this.props.enqueueSnackbar("Failed to get user data", {
          variant: "error",
        });
      }
    }
  }

  async getLatestTasks() {
    const projectId = cookie.get("project");

    try {
      const response = await axios.get(buildApiUrl("/tasks/?limit=5"), {
        params: { project: projectId },
        headers: { Authorization: this.props.token },
      });
      this.setState({
        latestTasks: response.data.results,
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
    const { availableCredits, storageUsage, projectData, latestTasks } = this.state;

    const locale = i18n.language;

    return (
      <div className={classes.root}>
        <Grid container spacing={3}>
          <Grid item xs={6} md={3}>
            <WelcomeCard />
          </Grid>
          <Grid item xs={6} md={3}>
            <PythonSDKCard />
          </Grid>
          <Grid item xs={6} md={6}>
            <UsageCard storageUsage={storageUsage} projectData={projectData}/>
          </Grid>
          <Grid item xs={6} md={3}>
            <CreditsCard availableCredits={availableCredits}/>
          </Grid>
          <Grid item xs={12} md={9}>
            <TasksCard tasks={latestTasks} t={t} locale={locale}/>
          </Grid>
        </Grid>
      </div>
    );
  }
}

HomeContent.propTypes = {
  classes: PropTypes.object.isRequired,
};

HomeContent = withStyles(styles)(HomeContent);
HomeContent = withTranslation("me")(HomeContent);

export default HomeContent;
