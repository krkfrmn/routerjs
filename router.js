// load the configuration settings
var config = require('./lib/config');
var log = require('./lib/log');

// load the http and https modules to create the router
var http = require('http');
var https = require('https');

// increase the number of sockets in each host-port pool. This normally defaults to 5.
http.Agent.defaultMaxSockets = 15;
https.Agent.defaultMaxSockets = 15;

// Load some required tools
var fs = require('fs');

var router_host = config.get('config:web:host');
var router_port = config.get('config:web:port');

// Put a friendly message on the console
console.log(config.get('env') + ' - Starting Router - http' +
  (config.get('config:web:secure') ? 's' : '') + '://'  +
  router_host + ':' + router_port + '/');

// Configure the HTTP router to respond to requests
var router = {};

// get rid of pesky annoying potential memory leak message
process.setMaxListeners(0);

function clientRequest (req, res, req_options, secure ) {
  var client_req;

  if (secure) {
    // Must use a secure connection
    client_req  = https.request(req_options,function (client_res) {
      processResponse(res,client_res);
    });
  } else {
    // Use an http connection
    client_req  = http.request(req_options, function (client_res) {
      processResponse(res,client_res);
    });
  }

  // handle socket errors
  client_req.on('error', function (exc) {
    // propogate the socket closure to the original request
    req.socket.end();
    log.msg('WARNING - request : ' + exc + '\n' + req.method + ' for ' + req.headers.host + req.url);
  });

  return client_req;

}

function processResponse (res, client_res) {
  // Error
  client_res.on('error', function(err) {
    log.err('ERROR - client response: ' + err);
  });

  // Write the response data upon receipt
  client_res.on('data', function(data) {
    res.write(data, 'binary');
  });

  // Close the connection
  client_res.on('end', function() {
    res.end();
  });

  res.writeHead(client_res.statusCode, '', client_res.headers);

  log.msg('Response Code: ' + client_res.statusCode);
}

function processRequest (req,res) {

  process.on('uncaughtException', function (err) {
    // handle errors gracefully
    log.err('EXCEPTION :', err, req.url);

    try {
      res.writeHead(500);
      res.end('Internal server error.');
    } catch (er) {
      log.err('Error sending 500', er, req.url);
    }
  });

  // wrap all requests in a try catch
  try {

    var host, port;

    // lookup the domain values
    var secure = config.get('config:web:secure');
    if (secure) {
      if (config.get('config:https')[req.headers.host]) {
        host = config.get('config:https')[req.headers.host].host;
        port = config.get('config:https')[req.headers.host].port;
      } else {
         throw 'Invalid lookup';
      }
    } else{
      if (config.get('config:http')[req.headers.host]) {
        host = config.get('config:http')[req.headers.host].host;
        port = config.get('config:http')[req.headers.host].port;
      } else {
        throw 'Invalid lookup';
      }
    }

    var req_options = {
      'host': host,
      'port': port,
      'path': req.url,
      'method': req.method,
      'headers': req.headers,
    };

    var client_req = clientRequest (req, res, req_options, secure);

    // Error
    req.on("error", function (err) {
      client_req.end();
      log.err('ERROR ' + err + ' ' + req.method + ' for ' + req.headers.host + req.url);
    });

    // Write the request data upon receipt
    req.on("data", function (chunk) {
      client_req.write(chunk, 'binary');
    });

    // Close the connection
    req.on("end", function () {
      client_req.end();
    });

    log.msg(req.method + ' for ' + req.headers.host + req.url);

  } catch (err) {
    // handle errors gracefully
    res.writeHead(404);
    res.end('404 Not Found');
    log.err('ERROR - ' + err );
  }
}

if (config.get('config:web:secure')) {
  // configure the encryption keys
  var options = {};
  var pfx = config.get('config:web:securePfx');
  if (pfx) {
    options.pfx = fs.readFileSync(pfx);
  }
  else  {
    options.key = fs.readFileSync(config.get('config:web:secureKey'));
    options.cert = fs.readFileSync(config.get('config:web:secureCert'));
  }
  // create an https router
  router = https.createServer(options, processRequest);
}
else {
  // create an http router
  router = http.createServer(processRequest);
}

router.on("clientError", function (exception, socket) {
  log.err('ignoring exception ' + exception + ' on ' + socket);
});

router.listen (router_port, router_host );

// Put a friendly message on the console
console.log(config.get('env') + ' - Router Started - http' + (config.get('config:web:secure') ? 's' : '') + '://'  +
  router_host + ':' + router_port + '/');
