# Cluster multiprocess launcher

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
const workerFunc = (listen) => {
  const http = getHttpServerFromSomewhere();
  // Some extern http server must be specified for a worker.
  listen(http);
};

const masterFunc = (listen) => {
  JustSomeMasterStuff();
  // Master listen need no extern http server, it will create his own.
  listen();
}

launch(
  worker: {
    main: workerFunc,
    listen: stickyListenWorker
  },
  master: {
    main: masterFunc,
    listen: stickyListenMaster
  },
  config: {
    threads: 4,
    host: {
      ip: 'localhost',
      port: 5000
    }
  }
);
```

## API

### .launch

### .stickyListenWorker

### .stickyListenMaster
