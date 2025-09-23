import Application from "./libary/Application.js";
import Router from "./libary/Router.js";
import parseJson from "./libary/parseJson.js";


const app = new Application();

app.use(parseJson);

const router = new Router();

const users = [{id: 1, name: "John"}, {id: 2, name: "Jane"}];

router.get("/users", (req, res) => {
    res.send(req.query);
});

router.post("/users", (req, res) => {
    res.send({received: req.body, raw: req.rawBody ?? null});
});

app.addRouter(router);

const port = 8000;
app.listen(port, () => {
    console.log(`Server started on url http://localhost:${port}`);
});