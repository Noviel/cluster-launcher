# Cluster multiprocess launcher

## bI?

Simple configurable launcher for Node.js based on cluster. Includes built-in sticky listeners.

## Install

`npm i osnova-cluster-launcher --save`

## Usage

```javascript
const {
  // Entry point
  launch,
  // Default built-in listen functions for worker and master,
  // that provide sticky connection for the client to specific
  // worker based on the client's ip address.
  // Usefull for Socket.IO
  stickyListenWorker,
  stickyListenMaster
} = require('osnova-cluster-launcher');

// Worker/Master will be called by launch with specified
// respectively listen function as a parameter.
// It is entry points of an application.
const workerFunc = (listen) => {
  // Some extern http server must be specified for a worker's listen.
  // Use express for example.
  const app = require('express')();
  const http = require('http').Server(app);

  app.get('*', (req, res) => { res.send(`Hello from worker pid:${process.pid}`); });
  listen(http);
};

const masterFunc = (listen) => {
  console.log('We are doing some crazy master stuff here!');
  // Master's listen need no extern http server, it will create his own.
  listen();
};

launch({
  worker: {
    // callback
    // signature: [listen function] => null
    main: workerFunc,
    // callback
    // signature: [http server object] => null
    // default: stickyListenWorker
    listen: stickyListenWorker
  },
  master: {
    // callback
    // signature: [listen function] => null
    main: masterFunc,
    // callback
    // signature: [{ ip, port, workers, workerCount }] => null
    // default: stickyListenMaster
    listen: stickyListenMaster
  },
  config: {
    // count of worker processes to spawn
    threads: 4,
    host: {
      ip: 'localhost',
      port: 5000
    }
  }
});
```

## API

### .launch (opts)
### .stickyListenWorker (http)
### .stickyListenMaster (opts)
