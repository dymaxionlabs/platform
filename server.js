const express = require("express");
const next = require("next");
const nextI18NextMiddleware = require("next-i18next/middleware");

const nextI18next = require("./i18n");

const app = next({ dev: process.env.NODE_ENV !== "production" });
const handle = app.getRequestHandler();

(async () => {
  await app.prepare();
  const server = express();

  server.use(nextI18NextMiddleware(nextI18next));

  server.get("/layers/:id", (req, res) => {
    const actualPage = "/layer";
    const queryParams = { id: req.params.id };
    app.render(req, res, actualPage, queryParams);
  });

  server.get("/maps/:id", (req, res) => {
    const actualPage = "/map";
    const queryParams = { id: req.params.id };
    app.render(req, res, actualPage, queryParams);
  });

  server.get("*", (req, res) => handle(req, res));

  await server.listen(3000);
  console.log("> Ready on http://localhost:3000"); // eslint-disable-line no-console
})();
