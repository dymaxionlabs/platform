import axios from "axios";
import PropTypes from "prop-types";
import React from "react";
import { i18n, withTranslation } from "../../i18n";
import { buildApiUrl } from "../../utils/api";
import { withStyles } from "@material-ui/core/styles";
import { routerPush } from "../../utils/router";
import { withSnackbar } from "notistack";

import {
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  Input,
  InputLabel,
  LinearProgress,
  Typography,
} from "@material-ui/core";

const styles = (theme) => ({
  main: {
    display: "block", // Fix IE 11 issue.
    marginLeft: theme.spacing(3),
    marginRight: theme.spacing(3),
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: "50%", // Fix IE 11 issue.
    marginTop: theme.spacing(2),
  },
  submit: {
    marginTop: theme.spacing(3),
    width: "20%",
  },
  passwordSubmit: {
    marginTop: theme.spacing(3),
    marginLeft: theme.spacing(1),
    width: "40%",
  },
  passwordReset: {
    marginTop: theme.spacing(2),
  },
});

class UserProfileContent extends React.Component {
  state = {
    loading: true,
    username: "",
    email: "",
    sendNotificationEmails: true,
    isSubmitting: false,
  };

  static async getInitialProps({ query }) {
    return {
      namespacesRequired: ["common"],
      query,
    };
  }

  componentDidMount() {
    this.fetchUserProfile();
  }

  async fetchUserProfile() {
    const { token } = this.props;
    try {
      var response = await axios.get(buildApiUrl("/auth/user/"), {
        headers: {
          "Accept-Language": i18n.language,
          Authorization: token,
        },
      });
      console.log("/auth/user/", response.data);

      const userData = response.data;
      const { profile } = userData;

      console.log("user data", userData);
      console.log("profile", profile);

      this.setState({
        email: userData.email,
        username: userData.username,
        sendNotificationEmails: profile.send_notification_emails,
      });
    } catch (error) {
      console.error(error);
      this.props.enqueueSnackbar("Failed to load user profile data", {
        variant: "error",
      });
    }

    this.setState({ loading: false });
  }

  onSendNotificationEmailsClick = (e) => {
    this.setState((prevState) => ({
      sendNotificationEmails: !prevState.sendNotificationEmails,
    }));
  };

  onEmailChange = (e) => {
    this.setState({ email: e.target.value });
  };

  onResetPasswordClick = () => {
    routerPush(
      `/password/reset?redirect=${encodeURIComponent("/home/profile")}`
    );
  };

  onSubmit = async () => {
    try {
      await this.saveUser();
      await this.saveUserProfile();
      this.props.enqueueSnackbar("Changes saved", { variant: "success" });
    } catch (error) {
      this.props.enqueueSnackbar("Failed to save changes", {
        variant: "error",
      });
      console.error(error);
    }
  };

  async saveUser() {
    const { username, token } = this.props;
    const { email } = this.state;

    return await axios.patch(
      buildApiUrl(`/users/${username}/`),
      { email },
      {
        headers: {
          "Accept-Language": i18n.language,
          Authorization: token,
        },
      }
    );
  }

  async saveUserProfile() {
    const { token, username } = this.props;
    const { sendNotificationEmails } = this.state;

    return await axios.patch(
      buildApiUrl(`/user-profiles/${username}/`),
      { send_notification_emails: sendNotificationEmails },
      {
        headers: {
          "Accept-Language": i18n.language,
          Authorization: token,
        },
      }
    );
  }

  render() {
    const { classes } = this.props;
    const { loading, isSubmitting, email, sendNotificationEmails } = this.state;

    return (
      <main className={classes.main}>
        <Typography component="h1" variant="h5">
          {"User Profile"}
        </Typography>

        <form className={classes.form}>
          <FormControl margin="normal" fullWidth className={classes.input}>
            <InputLabel htmlFor="email">{"email"}</InputLabel>
            <Input
              id="email"
              name="Email address"
              autoComplete="Type your e-mail address"
              value={email}
              onChange={this.onEmailChange}
              disabled={loading}
            />
          </FormControl>
          <FormControl margin="normal" required fullWidth>
            <FormControlLabel
              control={
                <Checkbox
                  checked={sendNotificationEmails}
                  color="primary"
                  onClick={this.onSendNotificationEmailsClick}
                  disabled={loading}
                />
              }
              label={
                "Send task notifications via email (training, prediction, etc.)"
              }
            />
          </FormControl>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            disabled={isSubmitting}
            className={classes.submit}
            onClick={this.onSubmit}
            disabled={loading}
          >
            {"Save"}
          </Button>
          <Button
            fullWidth
            variant="contained"
            color="secondary"
            className={classes.passwordSubmit}
            onClick={this.onResetPasswordClick}
          >
            {"Reset password"}
          </Button>
          {isSubmitting && <LinearProgress />}
        </form>
      </main>
    );
  }
}

UserProfileContent.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  enqueueSnackbar: PropTypes.func.isRequired,
};

UserProfileContent = withStyles(styles)(UserProfileContent);
UserProfileContent = withTranslation()(UserProfileContent);
UserProfileContent = withSnackbar(UserProfileContent);

export default UserProfileContent;
