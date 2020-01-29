import AppBar from "@material-ui/core/AppBar";
import Button from "@material-ui/core/Button";
import Divider from "@material-ui/core/Divider";
import Drawer from "@material-ui/core/Drawer";
import IconButton from "@material-ui/core/IconButton";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import ListItemText from "@material-ui/core/ListItemText";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import { withStyles } from "@material-ui/core/styles";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import AccountCircle from "@material-ui/icons/AccountCircle";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import CollectionsIcon from "@material-ui/icons/Collections";
import MapIcon from "@material-ui/icons/Map";
import MemoryIcon from "@material-ui/icons/Memory";
import MenuIcon from "@material-ui/icons/Menu";
import PowerSettingsNewIcon from "@material-ui/icons/PowerSettingsNew";
import VpnKeyIcon from "@material-ui/icons/VpnKey";
import axios from "axios";
import classNames from "classnames";
import cookie from "js-cookie";
import Head from "next/head";
import PropTypes from "prop-types";
import React from "react";
import CliengoLoader from "../../components/CliengoLoader";
import FilesContent from "../../components/home/FilesContent";
import HomeContent from "../../components/home/HomeContent";
import KeysContent from "../../components/home/KeysContent";
import MapsContent from "../../components/home/MapsContent";
import ModalContactContent from "../../components/home/ModalContactContent";
import ModelsContent from "../../components/home/ModelsContent";
import SelectProjectButton from "../../components/SelectProjectButton";
import { i18n, Link, withNamespaces } from "../../i18n";
import { buildApiUrl } from "../../utils/api";
import { logout, withAuthSync } from "../../utils/auth";
import { routerReplace } from "../../utils/router";

const drawerWidth = 200;

const styles = theme => ({
  root: {
    display: "flex"
  },
  toolbar: {
    paddingRight: 24 // keep right padding when drawer closed
  },
  toolbarIcon: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    padding: "0 8px",
    ...theme.mixins.toolbar
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    })
  },
  appBarShift: {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen
    })
  },
  menuButton: {
    marginLeft: 12,
    marginRight: 36
  },
  menuButtonHidden: {
    display: "none"
  },
  title: {
    display: "flex",
    flexGrow: 1,
    alignItems: "center"
  },
  titleLogo: {
    marginRight: 5
  },
  drawerPaper: {
    position: "relative",
    whiteSpace: "nowrap",
    width: drawerWidth,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen
    })
  },
  drawerPaperClose: {
    overflowX: "hidden",
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    }),
    width: theme.spacing.unit * 7,
    [theme.breakpoints.up("sm")]: {
      width: theme.spacing.unit * 9
    }
  },
  appBarSpacer: theme.mixins.toolbar,
  content: {
    flexGrow: 1,
    padding: theme.spacing.unit * 3,
    height: "100vh",
    overflow: "auto"
  },
  chartContainer: {
    marginLeft: -22
  },
  tableContainer: {
    height: 320
  },
  h5: {
    marginBottom: theme.spacing.unit * 2
  },
  button: {
    color: "white"
  },
  anchorButton: {
    textDecoration: "none"
  }
});

const sortedSections = ["files", "models", "viewer", "keys"];
const sortedSectionsBeta = ["files", "models", "viewer", "keys"];

const sections = {
  viewer: {
    key: "viewer",
    path: "/maps",
    icon: <MapIcon />,
    content: <MapsContent />
  },
  models: {
    key: "models",
    path: "/models",
    icon: <MemoryIcon />,
    content: <ModelsContent />
  },
  files: {
    key: "files",
    path: "/files",
    icon: <CollectionsIcon />,
    content: <FilesContent />
  },
  keys: {
    key: "keys",
    path: "/keys",
    icon: <VpnKeyIcon />,
    content: <KeysContent />
  }
};

let QuoteButton = ({ t, classes }) => (
  <a href="/quote" className={classes.anchorButton}>
    <Button className={classes.button}>{t("quote_btn.value")}</Button>
  </a>
);
QuoteButton.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired
};
QuoteButton = withStyles(styles)(QuoteButton);
QuoteButton = withNamespaces()(QuoteButton);

class Home extends React.Component {
  state = {
    open: true,
    section: null,
    beta: false,
    free: true,
    contextualMenuOpen: null,
    userEmail: "",
    contactModalOpen: false
  };

  static async getInitialProps({ query }) {
    return {
      namespacesRequired: ["me", "common"],
      query: query
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

  componentDidMount() {
    // If there is not selected project, go there
    const projectId = cookie.get("project");
    if (!projectId) {
      routerReplace("/select-project");
    }

    this.getUserData();
  }

  async getUserData() {
    const { token } = this.props;

    try {
      const response = await axios.get(buildApiUrl(`/auth/user/`), {
        headers: {
          "Accept-Language": i18n.language,
          Authorization: token
        }
      });

      const {
        email,
        profile: { in_beta, free }
      } = response.data;

      this.setState({ userEmail: email, beta: in_beta, free });

      if (in_beta) console.debug("Beta mode enabled");
      if (free) console.debug("Free mode enabled");
    } catch (error) {
      console.error(error);
    }
  }

  handleDrawerOpen = () => {
    this.setState({ open: true });
  };

  handleDrawerClose = () => {
    this.setState({ open: false });
  };

  handleSectionChange = section => {
    this.setState({ section });
  };

  handleContextualMenuClick = event => {
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
    const { t, classes, token } = this.props;
    const {
      section,
      open,
      beta,
      free,
      contextualMenuOpen,
      userEmail
    } = this.state;

    const sectionList = beta ? sortedSectionsBeta : sortedSections;
    const { contactModalOpen } = this.state;

    const originalContent = section && sections[section].content;
    const content =
      originalContent &&
      React.cloneElement(originalContent, {
        token,
        free
      });

    return (
      <div className={classes.root}>
        <Head>
          <title>{t("common:title")}</title>
          <CliengoLoader />
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
            <Typography
              component="h1"
              variant="h6"
              color="inherit"
              noWrap
              className={classes.title}
            >
              <img
                className={classes.titleLogo}
                src="/static/logo.png"
                height="24"
              />
              Dymaxion Labs Platform
            </Typography>
            <SelectProjectButton token={token} />
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
              <MenuItem>{userEmail}</MenuItem>
              <MenuItem onClick={this.profileLogout}>
                {t("common:logout_title")}
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
            )
          }}
          open={open}
        >
          <div className={classes.toolbarIcon}>
            <IconButton onClick={this.handleDrawerClose}>
              <ChevronLeftIcon />
            </IconButton>
          </div>
          <Divider />
          <List>
            {sectionList.map(key => (
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
                  <ListItemIcon>{sections[key].icon}</ListItemIcon>
                  <ListItemText primary={t(`sidebar.${key}`)} />
                </ListItem>
              </Link>
            ))}
          </List>
          <Divider />
        </Drawer>
        <main className={classes.content}>
          <div className={classes.appBarSpacer} />
          {section == null ? (
            <HomeContent token={token} free={free} />
          ) : (
            content
          )}
        </main>
      </div>
    );
  }
}

Home.propTypes = {
  classes: PropTypes.object.isRequired
};

Home = withStyles(styles)(Home);
Home = withNamespaces(["me", "common", "simple_modal_contact_form"])(Home);
Home = withAuthSync(Home);

export default Home;
