const express = require("express");
const next = require("next");
const nextI18NextMiddleware = require("next-i18next/middleware").default;

const nextI18next = require("./i18n");

const app = next({ dev: process.env.NODE_ENV !== "production" });
const handle = app.getRequestHandler();

(async () => {
  await app.prepare();
  const server = express();

  await nextI18next.initPromise;
  server.use(nextI18NextMiddleware(nextI18next));

  server.use(function(req, res, next) {
    if (req.path.substr(-1) == "/" && req.path.length > 1) {
      var query = req.url.slice(req.path.length);
      res.redirect(301, req.path.slice(0, -1) + query);
    } else {
      next();
    }
  });

  server.get("/layers", (req, res) => {
    return res.redirect("/home/layers");
  });

  server.get("/layers/:uuid", (req, res) => {
    const actualPage = "/layers";
    const queryParams = {
      uuid: req.params.uuid
    };
    app.render(req, res, actualPage, queryParams);
  });

  server.get("/maps", (req, res) => {
    return res.redirect("/home/maps");
  });

  server.get("/maps/:uuid", (req, res) => {
    const actualPage = "/maps";
    const queryParams = {
      uuid: req.params.uuid
    };
    app.render(req, res, actualPage, queryParams);
  });

  server.get("/me", (req, res) => {
    return res.redirect("/home");
  });

  server.get("/home/:section", (req, res) => {
    const { section } = req.params;
    return app.render(req, res, "/home", { section: section });
  });

  server.get("/models", (req, res) => {
    return res.redirect("/home/models");
  });

  server.get("/models/new/od/:step", (req, res) => {
    const { step } = req.params;
    const { id } = req.query;
    return app.render(req, res, "/models/new/od", { step: step, id: id });
  });

  server.get("/testdrive/:step", (req, res) => {
    const { step } = req.params;
    return app.render(req, res, "/testdrive", { step });
  });

  server.get("*", (req, res) => handle(req, res));

  await server.listen(3000);
  console.log("> Ready on http://localhost:3000"); // eslint-disable-line no-console
})();
