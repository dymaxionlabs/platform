import React from "react";
import PropTypes from "prop-types";
import LockOutlinedIcon from "@material-ui/icons/LockOutlined";
import Head from "next/head";
import cookie from "js-cookie";
import axios from "axios";
import { i18n, withTranslation, Link } from "../i18n";
import { withAuthSync, login, logout } from "../utils/auth";
import { buildApiUrl } from "../utils/api";
import { routerPush, routerPushQuery } from "../utils/router";
import { withStyles } from '@material-ui/core/styles';

import {
  Avatar,
  Button,
  LinearProgress,
  FormControl,
  FormHelperText,
  Input,
  InputLabel,
  Paper,
  Typography,
  Grid,
} from '@material-ui/core';

const styles = theme => ({
  main: {
    width: "auto",
    display: "block", // Fix IE 11 issue.
    marginLeft: theme.spacing(3),
    marginRight: theme.spacing(3),
    [theme.breakpoints.up(400 + theme.spacing(3) * 2)]: {
      width: 400,
      marginLeft: "auto",
      marginRight: "auto"
    }
  },
  subheader: {
    marginTop: theme.spacing(1),
    textAlign: "center"
  },
  errorMessage: {
    marginTop: theme.spacing(1),
    textAlign: "center",
    color: "red"
  },
  successMessage: {
    marginTop: theme.spacing(1),
    textAlign: "center",
    color: "green"
  },
  paper: {
    marginTop: theme.spacing(8),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: `${theme.spacing(2)}px ${theme.spacing(3)}px ${theme.spacing(3)}px`
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main
  },
  form: {
    width: "100%", // Fix IE 11 issue.
    marginTop: theme.spacing(1)
  },
  submit: {
    marginTop: theme.spacing(3)
  },
  loginPar: {
    marginTop: theme.spacing(2)
  }
});

class Invite extends React.Component {
  state = {
    username: "",
    email: "",
    password1: "",
    password2: "",
    err_username_msg: "",
    err_email_msg: "",
    err_password1_msg: "",
    err_password2_msg: "",
    inviteHasEmail: false,
    fatalError: "",
    showForm: false,
    loading: true
  };

  static async getInitialProps({ query }) {
    return {
      namespacesRequired: ["common"],
      query
    };
  }

  constructor(props) {
    super(props);
    // console.log(props)
    const { t, token, username } = props;
    const { key } = props.query;
    
    if (!key) {
      this.state = {
        ...this.state,
        fatalError: t("invite.invalid_key"),
        loading: false
      };
    } else {
      // If already logged in, show Confirm button only
      if (token) {
        this.state["alreadyLoggedIn"] = true;
      }
    }
  }

  componentDidMount() {
    const { t, username } = this.props;
    const { key } = this.props.query;
    
    if (this.state.fatalError) return;

    this.setState({ loading: true });

    // Retrieve token for validation
    axios
      .get(buildApiUrl(`/projects/invitations/${key}/`))
      .then(response => {
        const { data } = response;
        // console.log("dataget: ", data)
        if (data.email && data.confirmed) {
          this.setState({
            fatalError: t("invite.already_confirmed")
          });
          
        
        } else {
          this.setState({
            project: data.project,
            email: data.email,
            inviteHasEmail: !!data.email,
            username: data.username,
            tokenUser: data.username,
            showForm: true
          });
        }
      })
      .catch(err => {
        console.error(err);
        this.setState({ fatalError: t("invite.invalid_key") });
      })
      .then(() => {
        this.setState({ loading: false });
      });
  }

  onUsernameChange = e => {
    this.setState({ username: e.target.value });
  };

  onEmailChange = e => {
    this.setState({ email: e.target.value });
  };

  onPassword1Change = e => {
    this.setState({ password1: e.target.value });
  };

  onPassword2Change = e => {
    this.setState({ password2: e.target.value });
  };

  async _confirmInvitationToken(userToken) {
    const { key } = this.props.query;
    console.log(`confirm with ${userToken}`);

    try {
      return await axios.post(
        buildApiUrl(`/projects/invitations/${key}/confirm/`),
        {},
        {
          headers: {
            "Accept-Language": i18n.language,
            Authorization: userToken
          }
        }
      );
    } catch (err) {
      if (err.response) {
        console.error(err);
      }
    }
  }

  onConfirmSubmit = async event => {
    event.preventDefault();

    const { t, token } = this.props;
    const { redirect } = this.props.query;
    const confirmResponse = await this._confirmInvitationToken(token);

    this.setState({
      successMsg: t("invite.success_msg"),
      loading: false
    });

    // Set current project
    const { project } = confirmResponse.data;
    cookie.set("project", project);

    if (redirect) {
      routerPush(redirect);
    } else {
      routerPush("/home");
    }
  };

  onSubmit = async event => {
    event.preventDefault();

    const { t } = this.props;
    const { redirect } = this.props.query;
    const { username, email, password1, password2 } = this.state;

    const dataSend = {
      username: username,
      email: email,
      password1: password1,
      password2: password2
    };

    // Reset messages
    this.setState({
      errorMsg: "",
      successMsg: "",
      err_username_msg: "",
      err_email_msg: "",
      err_password1_msg: "",
      err_password2_msg: "",
      loading: true
    });

    let response;
    try {
      response = await axios.post(
        buildApiUrl("/auth/registration/"),
        dataSend,
        { headers: { "Accept-Language": i18n.language } }
      );
    } catch (error) {
      console.error(error);

      // Generic error message
      let errorMsg = t("invite.error_msg");

      // Parse error messages in response
      if (error.response && error.response.status === 400) {
        const { data } = error.response;
        for (let key in data) {
          this.setState({ [`err_${key}_msg`]: data[key] });
        }
        // Update general error message if available
        if (error.response.non_field_errors) {
          errorMsg = error.response.non_field_errors;
        }
      }

      this.setState({
        errorMsg: errorMsg,
        successMsg: "",
        loading: false
      });
    }

    const token = response.data.key;
    const confirmResponse = await this._confirmInvitationToken(token);

    // Regardless of confirmation, login user
    this.setState({
      successMsg: t("invite.success_msg"),
      loading: false
    });

    // Set current project
    const { project } = confirmResponse.data;
    cookie.set("project", project);

    login({ token: userToken, redirectTo: redirect });
  };

  render() {
    const { t, classes, username } = this.props;
    const { key, redirect } = this.props.query;
    const {
      loading,
      email,
      project,
      fatalError,
      alreadyLoggedIn,
      showForm
    } = this.state;

    const loginRedirect = `/invite?key=${encodeURIComponent(
      key
    )}&redirect=${encodeURIComponent(redirect || "")}`;

    return (
      <main className={classes.main}>
        <Head>
          <title>{t("title")}</title>
        </Head>
        <Paper className={classes.paper}>
          <Avatar className={classes.avatar}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            {t("invite.header")}
          </Typography>
          <Typography className={classes.subheader}>
            {!loading &&
              !fatalError &&
              
              (alreadyLoggedIn && username == this.state.username 
                ? t("invite.subheader_already_logged_in", { project })
                : t("invite.subheader", { project, email, username })
              )
            }

          </Typography>
          <Typography className={classes.successMessage}>
            {this.state.successMsg}
          </Typography>
          <Typography className={classes.errorMessage}>
            {this.state.errorMsg || fatalError}
          </Typography>
          {showForm &&
            (alreadyLoggedIn ?
              (this.state.tokenUser ? (
                this.state.tokenUser == username ?(
                    <form
                      className={classes.form}
                      method="post"
                      onSubmit={this.onConfirmSubmit}
                    >
                      <FormControl margin="normal" required fullWidth>
                        <Grid container spacing={3}>
                          <Grid item xs>
                            <Button
                              type="submit"
                              variant="contained"
                              color="primary"
                              fullWidth
                              disabled={fatalError !== "" || loading}
                            >
                              {t("invite.confirm")}
                            </Button>
                          </Grid>
                        </Grid>
                      </FormControl>
                    </form>
                ):
                <Typography className={classes.loginPar}>
                  {" "} {this.state.tokenUser} {" "}
                  <Link
                    href={{
                      pathname: "/login",
                      query: { redirect: loginRedirect, username: this.state.tokenUser}
                    }}
                  >
                    <a>{t("invite.login")}</a>
                  </Link>
                </Typography> 
                
              ):(<>
                <form
                  className={classes.form}
                  method="post"
                  onSubmit={this.onSubmit}
                >
                  <FormControl margin="normal" required fullWidth>
                    <InputLabel htmlFor="username">
                      {t("invite.username_placeholder")}
                    </InputLabel>
                    <Input
                      id="username"
                      name="username"
                      autoComplete="user"
                      autoFocus
                      onChange={this.onUsernameChange}
                      value={this.state.username}
                    />
                    {this.state.err_username_msg && (
                      <FormHelperText error>
                        {this.state.err_username_msg}
                      </FormHelperText>
                    )}
                  </FormControl>
                  {!this.state.inviteHasEmail && (
                    <FormControl margin="normal" required fullWidth>
                      <InputLabel htmlFor="email">
                        {t("invite.email_placeholder")}
                      </InputLabel>
                      <Input
                        id="email"
                        name="email"
                        autoComplete="email"
                        type="email"
                        onChange={this.onEmailChange}
                        value={this.state.email}
                      />
                      {this.state.err_email_msg && (
                        <FormHelperText error>
                          {this.state.err_email_msg}
                        </FormHelperText>
                      )}
                    </FormControl>
                  )}
                  <FormControl margin="normal" required fullWidth>
                    <InputLabel htmlFor="password1">
                      {t("invite.password1_placeholder")}
                    </InputLabel>
                    <Input
                      name="password1"
                      type="password"
                      id="password1"
                      onChange={this.onPassword1Change}
                      value={this.state.password1}
                    />
                    {this.state.err_password1_msg && (
                      <FormHelperText error>
                        {this.state.err_password1_msg}
                      </FormHelperText>
                    )}
                  </FormControl>
                  <FormControl margin="normal" required fullWidth>
                    <InputLabel htmlFor="password2">
                      {t("invite.password2_placeholder")}
                    </InputLabel>
                    <Input
                      name="password2"
                      type="password"
                      id="password2"
                      onChange={this.onPassword2Change}
                      value={this.state.password2}
                    />
                    {this.state.err_password2_msg && (
                      <FormHelperText error>
                        {this.state.err_password2_msg}
                      </FormHelperText>
                    )}
                  </FormControl>
                  <Grid container spacing={3}>
                    <Grid item xs>
                      <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        fullWidth
                        disabled={fatalError !== "" || loading}
                        className={classes.submit}
                      >
                        {t("invite.submit")}
                      </Button>
                    </Grid>
                  </Grid>
                </form>
                <Typography className={classes.loginPar}>
                  {t("invite.already_has_account")}{" "}
                  <Link
                    href={{
                      pathname: "/login",
                      query: { redirect: loginRedirect }
                    }}
                  >
                    <a>{t("invite.login")}</a>
                  </Link>
                </Typography>
              </>)) 
              : ( this.state.tokenUser ? 
                  (this.state.tokenUser && !username  
                  &&(routerPushQuery("/login", this.state.tokenUser, loginRedirect)) 
                  )
                  :(
                  <>
                    <form
                      className={classes.form}
                      method="post"
                      onSubmit={this.onSubmit}
                    >
                      <FormControl margin="normal" required fullWidth>
                        <InputLabel htmlFor="username">
                          {t("invite.username_placeholder")}
                        </InputLabel>
                        <Input
                          id="username"
                          name="username"
                          autoComplete="user"
                          autoFocus
                          onChange={this.onUsernameChange}
                          value={this.state.username}
                        />
                        {this.state.err_username_msg && (
                          <FormHelperText error>
                            {this.state.err_username_msg}
                          </FormHelperText>
                        )}
                      </FormControl>
                      {!this.state.inviteHasEmail && (
                        <FormControl margin="normal" required fullWidth>
                          <InputLabel htmlFor="email">
                            {t("invite.email_placeholder")}
                          </InputLabel>
                          <Input
                            id="email"
                            name="email"
                            autoComplete="email"
                            type="email"
                            onChange={this.onEmailChange}
                            value={this.state.email}
                          />
                          {this.state.err_email_msg && (
                            <FormHelperText error>
                              {this.state.err_email_msg}
                            </FormHelperText>
                          )}
                        </FormControl>
                      )}
                      <FormControl margin="normal" required fullWidth>
                        <InputLabel htmlFor="password1">
                          {t("invite.password1_placeholder")}
                        </InputLabel>
                        <Input
                          name="password1"
                          type="password"
                          id="password1"
                          onChange={this.onPassword1Change}
                          value={this.state.password1}
                        />
                        {this.state.err_password1_msg && (
                          <FormHelperText error>
                            {this.state.err_password1_msg}
                          </FormHelperText>
                        )}
                      </FormControl>
                      <FormControl margin="normal" required fullWidth>
                        <InputLabel htmlFor="password2">
                          {t("invite.password2_placeholder")}
                        </InputLabel>
                        <Input
                          name="password2"
                          type="password"
                          id="password2"
                          onChange={this.onPassword2Change}
                          value={this.state.password2}
                        />
                        {this.state.err_password2_msg && (
                          <FormHelperText error>
                            {this.state.err_password2_msg}
                          </FormHelperText>
                        )}
                      </FormControl>
                      <Grid container spacing={3}>
                        <Grid item xs>
                          <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            fullWidth
                            disabled={fatalError !== "" || loading}
                            className={classes.submit}
                          >
                            {t("invite.submit")}
                          </Button>
                        </Grid>
                      </Grid>
                    </form>
                    <Typography className={classes.loginPar}>
                      {t("invite.already_has_account")}{" "}
                      <Link
                        href={{
                          pathname: "/login",
                          query: { redirect: loginRedirect }
                        }}
                      >
                        <a>{t("invite.login")}</a>
                      </Link>
                    </Typography>
                  </> )
                )
                )}
          {loading && <LinearProgress />}
        </Paper>
      </main>
    );
  }
}

Invite.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired
};

Invite = withStyles(styles)(Invite);
Invite = withTranslation()(Invite);
Invite = withAuthSync(Invite, { redirect: false });

export default Invite;
