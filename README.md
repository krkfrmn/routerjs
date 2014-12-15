# routerjs

A name-based HTTP/HTTPS router that monitors a json routing table and updates routes on the fly. It allows for multiple web services to be identified via host/port combinations and routed to by sub-domain through well known ports.

## Usage
Using routerjs is easy; it is designed to be managed by a cascade of config files whose ultimate configuration is specified by the environment (dev/test/prod etc.). A config file called _default.json is always loaded and then specific config values may be overridden by a second config file matching the set environment (<env>.json).

For convenience, a shell script is provided to start multiple instances (i.e. http and https) of the router. The example below will start both an http and https router.
```
./router.sh p s 
```
This sample config file below defines an http router through 192.168.0.102:80 to various ports on 192.168.0.20. Presumably, one would direct all "domain.com" traffic to 192.168.0.102 and then subsequently filter via sub-domain name. 

-- sample _default.json --
```
{
  "config" : {

    "web": {
      "host": "192.168.0.102"
    , "port": "80"
    , "secure" : 0
    , "secureKey" : "./keys/key.pem"
    , "secureCert" : "./keys/cert.pem"
    , "securePfx" : 0
    },

    "http" : {
      "dev.domain.com" :         { "host" : "192.168.0.20", "port" : 8001 }
    , "test.domain.com" :        { "host" : "192.168.0.20", "port" : 8002 }
    , "cdn.domain.com" :         { "host" : "192.168.0.20", "port" : 8005 }
    , "data.domain.com" :        { "host" : "192.168.0.20", "port" : 8004 }
    },

    "https" : {
      "domain.com" :         { "host" : "192.168.0.20", "port" : 8003 }
    , "secure.domain.com" :  { "host" : "192.168.0.20", "port" : 8003 }
    , "scdn.domain.com" :    { "host" : "192.168.0.20", "port" : 8006 }
    },

    "verbose" : {
      "console" : 0
    , "errors" : 1
    }
  }
}
```

## Installation

### SSL Support
To support SSL, point the config to your existing certificate or create a self-signed certificate.

```
  mkdir keys
  cd keys
  openssl genrsa -out key.pem
  openssl req -new -key key.pem -out csr.pem
  openssl x509 -req -days 9999 -in csr.pem -signkey key.pem -out cert.pem
  rm csr.pem
```

### Support For Ports Below 1024 
Use authbind to allow node execution on ports below 1024. Replace "user" with your own user.

```
  [sudo] apt-get install authbind
```
--port 80 --
```
  [sudo] touch /etc/authbind/byport/80
  [sudo] chown user /etc/authbind/byport/80
  [sudo] chmod 755 /etc/authbind/byport/80
```
-- port 443 --
```
  [sudo] touch /etc/authbind/byport/443
  [sudo] chown user /etc/authbind/byport/443
  [sudo] chmod 755 /etc/authbind/byport/443
```


#### Author: Kirk Freeman
#### License: ISC
