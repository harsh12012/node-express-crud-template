// cluster.js
const cluster = require('cluster');
const os = require('os');
const dotenv = require('dotenv');

dotenv.config();

if (cluster.isMaster) {
  const numCPUs = os.cpus().length - 1;

  // Fork workers
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died`);
  });
} else {
  require('./app');
}
