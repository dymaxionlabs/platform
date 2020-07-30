import { Component } from "react";
import { routerPush } from "./router";
import nextCookie from "next-cookies";
import cookie from "js-cookie";
import querystring from "querystring";

export const login = async ({
  username,
  token,
  expires,
  redirectTo = "/home",
}) => {
  cookie.set("token", token, { expires: expires });
  cookie.set("username", username, { expires: expires });
  if (!redirectTo) {
    redirectTo = "/home";
  }
  routerPush(redirectTo);
};

export const logout = () => {
  cookie.remove("token");
  cookie.remove("username");
  cookie.remove("project");
  // to support logging out from all windows
  window.localStorage.setItem("logout", Date.now());
  routerPush("/login");
};

// Gets the display name of a JSX component for dev tools
const getDisplayName = (Component) =>
  Component.displayName || Component.name || "Component";

export const withAuthSync = (WrappedComponent, options) =>
  class extends Component {
    static displayName = `withAuthSync(${getDisplayName(WrappedComponent)})`;

    static async getInitialProps(ctx) {
      const { redirect } = options || {};
      const { username, token } = auth(ctx, redirect);

      const componentProps =
        WrappedComponent.getInitialProps &&
        (await WrappedComponent.getInitialProps(ctx));

      return { ...componentProps, username, token };
    }

    constructor(props) {
      super(props);

      this.syncLogout = this.syncLogout.bind(this);
    }

    componentDidMount() {
      window.addEventListener("storage", this.syncLogout);
    }

    componentWillUnmount() {
      window.removeEventListener("storage", this.syncLogout);
      window.localStorage.removeItem("logout");
    }

    syncLogout(event) {
      if (event.key === "logout") {
        console.log("logged out from storage!");
        this.onLogout();
      }
    }

    onLogout() {
      routerPush("/login");
    }

    render() {
      return <WrappedComponent {...this.props} />;
    }
  };

export const auth = (ctx, redirect) => {
  const { username, token } = nextCookie(ctx);

  if (typeof redirect === "undefined") {
    redirect = true;
  }

  if (redirect) {
    if (!token || !username) {
      if (ctx.req) {
        const query = querystring.stringify({ redirect: ctx.req.url });
        ctx.res.writeHead(302, { Location: `/login?${query}` });
        ctx.res.end();
        return;
      } else {
        routerPush("/login");
      }
    }
  }

  return { username, token };
};
