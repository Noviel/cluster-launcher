# Cluster multiprocess launcher

## bI?

Simple configurable launcher for Node.js based on cluster. Includes built-in sticky listeners.

## Install

`npm i osnova-cluster-launcher --save`

## Usage

```javascript
const {
  launch,
  stickyListenWorker,
  stickyListenMaster
} = require('osnova-cluster-launcher');

const workerFunc = (listen) => {
  // Use express for example.
  const app = require('express')();
  const http = require('http').Server(app);

  app.get('*', (req, res) => { res.send(`Hello from worker pid:${process.pid}`); });
  listen(http);
};

const masterFunc = (listen) => {
  console.log('We are doing some crazy master stuff here!');
  listen();
};

launch({
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
});
```

## API

### .launch(opts)
@param opts { object } options object  

Expected that master and worker will call `listen` by themselves, because they can contain some async init functions.

##### Options object
- **config** { object }  
  - **threads** { number } count of worker processes to spawn. `default: 1`
  - **host** { object } web server configuration
    - **ip** { string } `default: 'localhost'`
    - **port** { number } `default: 8080`
- **worker**
  - **main** { function } entry point of the every worker, takes `listen` as a parameter
  - **listen** { function } `default: stickyListenWorker`
- **master**
  - **main** { function } entry point of the master
  - **listen** { function } `default: stickyListenMaster`

`worker`/`master`'s `main` will be called with specified to them listen function as a parameter.

##### Worker's listen
Expects `http` server object as a parameter.

##### Master's listen 
Will be wrapped in function that takes no arguments. Because of it in the master's `main` you should just do `listen()`. But inside it will be called by `launch` with options object as a parameter:
- **ip** { string }
- **port** { number }
- **workers** { array }


### .stickyListenWorker, .stickyListenMaster
Default built-in listen function for worker, that provide sticky connection for the client to 
specific worker based on the client's ip address. Usefull for Socket.IO.