import React from "react";
import withGA from "../components/withGA";
import App, { Container } from "next/app";
import { appWithTranslation, Router } from "../i18n";
import i18next from "i18next";

class MyApp extends App {
  static async getInitialProps({ Component, router, ctx }) {
    let pageProps = {};

    if (Component.getInitialProps) {
      pageProps = await Component.getInitialProps(ctx);
    }

    return { pageProps };
  }

  componentDidMount() {
    const {
      query: { lang }
    } = this.props.router;

    if (lang) {
      console.log(`Setting language to '${lang}'`);
      i18next.changeLanguage(lang);
    }
  }

  render() {
    const { Component, pageProps, analytics } = this.props;

    return (
      <Container>
        <Component {...pageProps} analytics={analytics} />
      </Container>
    );
  }
}

export default appWithTranslation(withGA("UA-105156301-5", Router)(MyApp));
