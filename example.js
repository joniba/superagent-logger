const request = {};//require('superagent');
const debug = require('debug')('ros:http');
const silly = require('debug')('ros:http:silly');
const initLogger = require('./');
const logger = initLogger({ logger: debug, outgoing: true, requestLogger: silly, responseLogger: silly });

request.get('https://github.com/').use(logger).query({ q: 'search' }).end();
request.post('https://github.com/').use(logger).end();
