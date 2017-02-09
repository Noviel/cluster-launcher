// Created by snov on 09.02.2017.
//
// Sticky master routine
//
/////////////////////////////////////////////////////////////////
const net = require('net');

const getWorkerIndex = (ip, len) => {
  let s = '';
  for (let i = 0, _len = ip.length; i < _len; i++) {
    if (!isNaN(ip[i])) {
      s += ip[i];
    }
  }

  return Number(s) % len;
};

function stickyListen(opts) {
  const { ip, port, workerCount, workers } = opts;

  const server = net.createServer({pauseOnConnect: true}, connection => {
    const worker = workers[getWorkerIndex(connection.remoteAddress || '', workerCount)];
    worker.send('sticky-session:connection', connection);
  }).listen(port);

  console.log(`Web server started on ${ip}:${port}`);
}

module.exports = stickyListen;