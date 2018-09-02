import * as http from "http";
import app from "./express-app";


export class Server {
    server: http.Server;

    constructor(port: string) {
        this.server = http.createServer(app);
        this.server.listen(port, () => {
            console.log("listening on *:" + port);
        });
    }
}


