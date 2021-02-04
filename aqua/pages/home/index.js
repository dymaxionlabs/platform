import {
  AppBar,
  Button,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  Menu,
  MenuItem,
  Toolbar,
  Tooltip,
  Typography,
  Chip,
} from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";
import AttachMoneyIcon from "@material-ui/icons/AttachMoney";
import AccountCircle from "@material-ui/icons/AccountCircle";
import AllInboxIcon from "@material-ui/icons/AllInbox";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import CollectionsIcon from "@material-ui/icons/Collections";
import DashboardIcon from "@material-ui/icons/Dashboard";
import BarChartIcon from "@material-ui/icons/BarChart";
import MemoryIcon from "@material-ui/icons/Memory";
import MenuIcon from "@material-ui/icons/Menu";
import PersonIcon from "@material-ui/icons/Person";
import MapIcon from "@material-ui/icons/Map";
import PowerSettingsNewIcon from "@material-ui/icons/PowerSettingsNew";
import VpnKeyIcon from "@material-ui/icons/VpnKey";
import classNames from "classnames";
import cookie from "js-cookie";
import Head from "next/head";
import PropTypes from "prop-types";
import React from "react";
import CreditsContent from "../../components/home/CreditsContent";
import FilesContent from "../../components/home/FilesContent";
import HomeContent from "../../components/home/HomeContent";
import KeysContent from "../../components/home/KeysContent";
import MapsContent from "../../components/home/MapsContent";
import ModalContactContent from "../../components/home/ModalContactContent";
import ModelsContent from "../../components/home/ModelsContent";
import TasksContent from "../../components/home/TasksContent";
import TablesContent from "../../components/home/TablesContent";
import UserProfileContent from "../../components/home/UserProfileContent";
import SelectProjectButton from "../../components/SelectProjectButton";
import { Link, withTranslation } from "../../i18n";
import { logout, withAuthSync } from "../../utils/auth";
import { routerPush } from "../../utils/router";
import { withSnackbar } from "notistack";
import { buildApiUrl } from "../../utils/api";
import axios from "axios";

const drawerWidth = 200;

const styles = (theme) => ({
  root: {
    display: "flex",
  },
  toolbar: {
    paddingRight: 24, // keep right padding when drawer closed
  },
  toolbarIcon: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    padding: "0 8px",
    ...theme.mixins.toolbar,
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  menuItem: {
    minWidth: 150,
  },
  menuButton: {
    marginLeft: 12,
    marginRight: 36,
  },
  menuButtonHidden: {
    display: "none",
  },
  title: {
    display: "flex",
    flexGrow: 1,
    alignItems: "center",
    cursor: "pointer",
  },
  titleLogo: {
    marginRight: 5,
  },
  betaChip: {
    marginLeft: theme.spacing(1),
    marginTop: 3,
  },
  drawerPaper: {
    position: "relative",
    whiteSpace: "nowrap",
    width: drawerWidth,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  drawerPaperClose: {
    overflowX: "hidden",
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    width: theme.spacing(7),
    [theme.breakpoints.up("sm")]: {
      width: theme.spacing(7),
    },
  },
  appBarSpacer: theme.mixins.toolbar,
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
    height: "100vh",
    overflow: "auto",
  },
  chartContainer: {
    marginLeft: -22,
  },
  tableContainer: {
    height: 320,
  },
  h5: {
    marginBottom: theme.spacing(2),
  },
  button: {
    color: "white",
  },
  anchorButton: {
    textDecoration: "none",
  },
});

const sortedSections = [
  "files",
  "tasks",
  "models",
  "tables",
  "viewer",
  "_divider",
  "keys",
  "credits",
  "profile",
];

const sections = {
  viewer: {
    key: "viewer",
    path: "/maps",
    icon: <MapIcon />,
    content: <MapsContent />,
  },
  models: {
    key: "models",
    path: "/models",
    icon: <MemoryIcon />,
    content: <ModelsContent />,
  },
  tables: {
    key: "tables",
    path: "/tables",
    icon: <BarChartIcon />,
    content: <TablesContent />,
  },
  files: {
    key: "files",
    path: "/files",
    icon: <CollectionsIcon />,
    content: <FilesContent />,
  },
  tasks: {
    key: "tasks",
    path: "/tasks",
    icon: <AllInboxIcon />,
    content: <TasksContent />,
  },
  keys: {
    key: "keys",
    path: "/keys",
    icon: <VpnKeyIcon />,
    content: <KeysContent />,
  },
  credits: {
    key: "credits",
    path: "/credits",
    icon: <AttachMoneyIcon />,
    content: <CreditsContent />,
  },
  profile: {
    key: "profile",
    path: "/profile",
    icon: <PersonIcon />,
    content: <UserProfileContent />,
  },
};

class Home extends React.Component {
  state = {
    loading: true,
    projectName: null,
    section: null,
    open: true,
    contextualMenuOpen: null,
    contactModalOpen: false,
  };

  static async getInitialProps({ query }) {
    return {
      namespacesRequired: ["me", "common"],
      query: query,
    };
  }

  constructor(props) {
    super(props);

    let { section } = props.query;

    // Set current section based on path
    if (section && sortedSections.includes(section)) {
      this.state.section = section;
    }
  }

  async componentDidMount() {
    await this.getCurrentProject();
  }

  async getCurrentProject() {
    const id = cookie.get("project");
    const tablesEnabled = cookie.get("tablesEnabled");
    const modelsEnabled = cookie.get("modelsEnabled");

    // If some cookie is not present, force user to select project again
    if (!id || !tablesEnabled || !modelsEnabled) {
      routerPush("/select-project");
      return;
    }

    const { token } = this.props;

    try {
      const response = await axios.get(buildApiUrl(`/projects/${id}/`), {
        headers: { Authorization: token },
      });
      this.setState({
        projectName: response.data.name,
        loading: false,
      });
    } catch (err) {
      const response = err.response;
      if (response) {
        if (response.status === 401) {
          logout();
          return;
        } else {
          console.error(response);
        }
      } else {
        console.error(err);
      }
      // Force user to select another project
      routerPush("/select-project");
    }
  }

  handleDrawerOpen = () => {
    this.setState({ open: true });
  };

  handleDrawerClose = () => {
    this.setState({ open: false });
  };

  handleSectionChange = (section) => {
    this.setState({ section });
  };

  handleContextualMenuClick = (event) => {
    this.setState({ contextualMenuOpen: event.currentTarget });
  };

  handleContextualMenuClose = () => {
    this.setState({ contextualMenuOpen: null });
  };

  handleClickOpen = () => {
    this.setState({ contactModalOpen: true });
  };

  handleContactModalClose = () => {
    this.setState({ contactModalOpen: false });
  };

  profileLogout = () => {
    logout();
  };

  render() {
    const { t, classes, token, username } = this.props;
    const {
      loading,
      section,
      projectName,
      open,
      contextualMenuOpen,
    } = this.state;

    const modelsEnabled = cookie.get("modelsEnabled") === "true" ? true : false;
    const tablesEnabled = cookie.get("tablesEnabled") === "true" ? true : false;

    const sectionList = sortedSections.filter(
      (section) =>
        (section === "models" && modelsEnabled) ||
        (section === "tables" && tablesEnabled) ||
        (section !== "models" && section !== "tables")
    );

    const { contactModalOpen } = this.state;

    const originalContent = section && sections[section].content;
    const content =
      originalContent &&
      React.cloneElement(originalContent, {
        token,
        username,
      });

    return (
      <div className={classes.root}>
        <Head>
          <title>{t("common:title")}</title>
        </Head>
        <AppBar
          position="absolute"
          className={classNames(classes.appBar, open && classes.appBarShift)}
        >
          <Toolbar disableGutters={!open} className={classes.toolbar}>
            <IconButton
              color="inherit"
              aria-label="Open drawer"
              onClick={this.handleDrawerOpen}
              className={classNames(
                classes.menuButton,
                open && classes.menuButtonHidden
              )}
            >
              <MenuIcon />
            </IconButton>
            <Link href="/">
              <img
                className={classes.titleLogo}
                src="/static/logo_wh.png"
                height="24"
              />
            </Link>
            <div className={classes.title}>
              <Link href="/">
                <Typography component="h1" variant="h6" color="inherit" noWrap>
                  Dymaxion Labs Platform
                </Typography>
              </Link>
              <Chip
                className={classes.betaChip}
                label="Beta"
                color="secondary"
              />
            </div>
            <SelectProjectButton token={token} name={projectName} />
            <Button className={classes.button} onClick={this.handleClickOpen}>
              {t("simple_modal_contact_form:header")}
            </Button>
            <ModalContactContent
              open={contactModalOpen}
              onClose={this.handleContactModalClose}
              token={token}
            />
            <IconButton
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              color="inherit"
              onClick={this.handleContextualMenuClick}
            >
              <AccountCircle />
            </IconButton>
            <Menu
              anchorEl={contextualMenuOpen}
              keepMounted
              open={Boolean(contextualMenuOpen)}
              onClose={this.handleContextualMenuClose}
            >
              <MenuItem className={classes.menuItem}>{username}</MenuItem>
              <MenuItem
                className={classes.menuItem}
                onClick={this.profileLogout}
              >
                {t("common:logout_btn")}
                <ListItemSecondaryAction>
                  <ListItemIcon edge="end" aria-label="logout">
                    <PowerSettingsNewIcon />
                  </ListItemIcon>
                </ListItemSecondaryAction>
              </MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>
        <Drawer
          variant="permanent"
          classes={{
            paper: classNames(
              classes.drawerPaper,
              !open && classes.drawerPaperClose
            ),
          }}
          open={open}
        >
          <div className={classes.toolbarIcon}>
            <IconButton onClick={this.handleDrawerClose}>
              <ChevronLeftIcon />
            </IconButton>
          </div>
          <Divider />
          <Link href={`/home`}>
            <ListItem
              button
              onClick={() => this.handleSectionChange(null)}
              selected={!section}
            >
              <Tooltip title={open ? "" : t(`sidebar.dashboard`)}>
                <ListItemIcon>
                  <DashboardIcon />
                </ListItemIcon>
              </Tooltip>
              <ListItemText primary={t(`sidebar.dashboard`)} />
            </ListItem>
          </Link>
          <Divider />
          <List>
            {sectionList.map((key, i) =>
              key === "_divider" ? (
                <Divider key={`divider-${i}`} />
              ) : (
                <Link
                  key={key}
                  href={`/home?section=${key}`}
                  as={`/home${sections[key].path}`}
                >
                  <ListItem
                    button
                    onClick={() => this.handleSectionChange(key)}
                    selected={section === key}
                  >
                    <Tooltip title={open ? "" : t(`sidebar.${key}`)}>
                      <ListItemIcon>{sections[key].icon}</ListItemIcon>
                    </Tooltip>
                    <ListItemText primary={t(`sidebar.${key}`)} />
                  </ListItem>
                </Link>
              )
            )}
          </List>
        </Drawer>
        <main className={classes.content}>
          <div className={classes.appBarSpacer} />
          {!loading &&
            (section == null ? <HomeContent token={token} /> : content)}
        </main>
      </div>
    );
  }
}

Home.propTypes = {
  classes: PropTypes.object.isRequired,
};

Home = withStyles(styles)(Home);
Home = withTranslation(["me", "common", "simple_modal_contact_form"])(Home);
Home = withAuthSync(Home);
Home = withSnackbar(Home);

export default Home;
