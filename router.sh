#!/bin/sh -
# navigate  to  application directory
cd ~/router

# kill all current node processes
echo "Stopping all existing node processes..."
killall node

debug=0

# if no environment specified then set a default configuration
if [ $# -eq 0 ]; then
  params="p"
  debug=0
else
  params="$@"
fi

for var in $params
do

  if [ "$var" = "-d" -o "$var" = "-debug" ]; then
    debug=1
    env="debug"
  elif [ "$var" = "p" -o "$var" = "P" ]; then
    env="prod"
  fi

  if [ "$env" != "" ]; then
    # start the specified system

    if [ $debug -ne 0 ]; then
      echo "node-inspector & env=$env authbind node --debug-brk router.js | tee ../$env.out &"
      node-inspector & env=$env authbind node --debug-brk router.js | tee ../$env.out &
    else
      echo "env=$env authbind node router.js | tee ../$env.out &"
      env=$env authbind node router.js | tee ../$env.out &
    fi
    env=""
    debug=0
  fi

done
