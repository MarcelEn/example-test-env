import cluster from "cluster";
import serverWorker from "./serverWorker";
import os from "os";

if (cluster.isMaster) {
    os.cpus().forEach(() => {
        cluster.fork(process.env);
    });
} else {
    serverWorker();
}