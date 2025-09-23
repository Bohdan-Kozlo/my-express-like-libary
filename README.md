# Tiny Express-like HTTP library

A minimal Node.js microframework with a router, middlewares, and simple JSON responses.

- Router: get, post, put, delete
- Middlewares via `app.use(fn)`
- Simple Application abstraction
- Request helpers: `req.query`, `req.path`, `req.body`, `req.rawBody`

## Quick start

- Run demo server:
  - `npm start`
- Open: http://localhost:8000/users

## Minimal example

```js
import Application from "./libary/Application.js";
import Router from "./libary/Router.js";
import parseJson from "./libary/parseJson.js";

const app = new Application();
app.use(parseJson);

const router = new Router();
router.get("/hello", (req, res) => res.send({ hello: "world", query: req.query }));

app.addRouter(router);
app.listen(8000, () => console.log("http://localhost:8000"));
```

