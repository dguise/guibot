import * as express from "express";
import * as bodyParser from "body-parser";

const app: express.Express = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.post('/', (req, res) => {
    res.send(req.body["challenge"]);
    console.log(req.body["challenge"]);
});

export default app;
