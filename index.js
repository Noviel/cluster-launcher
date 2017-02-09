const util = require('util');
const cluster = require('cluster');

const defaults = require('osnova-lib').core.defaults;

const stopSignals = [
        'SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
        'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
      ];

const production = process.env.NODE_ENV === 'production';

const spawn = (workers, i) => {
  workers[i] = cluster.fork();
  workers[i].on('exit', function (code, signal) {
    console.log('respawning worker', i);
    spawn(workers, i);
  });
};

const defaultTarget = {
  threads: 1,

  host: {
    port: 8080,
    ip: 'localhost'
  }
};

function launch(opts) {
  let stopping = false;
  let workers = [];

  const target = defaults(opts.config, defaultTarget);
  const port = target.host.port;
  const ip = target.host.ip;
  const threads = target.threads;

  cluster.on('disconnect', function (worker) {
    if (production) {
      if (!stopping) {
        cluster.fork();
      }
    } else {
      process.exit(1);
    }
  });


  if (cluster.isMaster) {
    const workerCount = threads;

    console.log(`Starting ${workerCount} workers...`);

    for (let i = 0; i < workerCount; i++) {
      spawn(workers, i);
    }

    cluster.on('exit', (worker, code, signal) => {
      console.log(`worker ${worker.process.pid} died`);
    });

    if (production) {
      stopSignals.forEach(function (signal) {

        process.on(signal, function () {
          console.log(`Got ${signal}, stopping workers...`);
          stopping = true;

          cluster.disconnect(function () {
            console.log('All workers stopped, exiting.');
            process.exit(0);
          });
        });
      });
    }
    
    opts.master.main((http) => {
      if (typeof opts.master.listen === 'function') {
        opts.master.listen({ip, port, workers, workerCount});
      }
    });
  } else {
    // worker should execute listen function by itself,
    // because it can contain some async initializing stuff
    opts.worker.main(opts.worker.listen);
  }
}

module.exports = {
  launch: launch,
  stickyListenWorker: require('./lib/listen-sticky/worker'),
  stickyListenMaster: require('./lib/listen-sticky/master')
};
