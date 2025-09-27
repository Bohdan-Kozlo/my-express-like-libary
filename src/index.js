import Application from "./libary/Application.js";
import Router from "./libary/Router.js";
import parseJson from "./libary/parseJson.js";


const app = new Application();

app.use(parseJson);

const router = new Router();

const users = [{id: 1, name: "John"}, {id: 2, name: "Jane"}];

router.get("/users", (req, res) => {
    res.send(users);
});

router.get("/usersquery", (req, res) => {
    res.send(req.query);
});

router.post("/users", (req, res) => {
    res.send({received: req.body, raw: req.rawBody ?? null});
});

router.get("/posts/:postId/comments/:commentId", (req, res) => {
    res.send({
        post: req.params.postId,
        comment: req.params.commentId,
    });
});

app.addRouter(router);

const port = 8000;
app.listen(port, () => {
    console.log(`Server started on url http://localhost:${port}`);
});