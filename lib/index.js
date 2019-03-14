const _ = require('lodash');
const url = require('url');
const querystring = require('querystring');
const chalk = require('chalk');
const debug = require('debug');

module.exports = function (options = {}) {
    return function (request) {
        return attachSuperagentLogger(options, request);
    };
};

function attachSuperagentLogger({ logger, outgoing, timestamp, requestLogger, responseLogger }, req) {
    logger = logger || debug('superagent');
    const start = new Date().getTime();
    const uri = url.parse(req.url);
    const method = req.method;

    if (timestamp)
        timestamp = new Date().toISOString();

    if (outgoing) {
        logger('%s %s %s %s %s %s',
            chalk.gray(rightPad(uri.protocol.toUpperCase().replace(/[^\w]/g, ''), 5)),
            chalk.gray(rightPad(method.toUpperCase(), 'delete'.length)),
            timestamp ? chalk.gray('[' + timestamp + ']') : '',
            chalk.gray(' - '),
            chalk.gray(uri.href + (req.qs ? '' : '?' + querystring.encode(req.qs))),
            chalk.gray('(pending)')
        );
        if (requestLogger)
            requestLogger(req);
        // logger(_.pick(req, 'method','url','header','qs'));
    }

    req.on('response', function (res) {
        const now = new Date().getTime();
        const elapsed = now - start;
        const status = getStatus(res);

        logger('%s %s %s %s %s %s',
            chalk.magenta(rightPad(uri.protocol.toUpperCase().replace(/[^\w]/g, ''), 5)),
            chalk.cyan(rightPad(method.toUpperCase(), 'delete'.length)),
            timestamp ? chalk.gray('[' + timestamp + ']') : '',
            status,
            chalk.gray(uri.href + (req.qs ? '' : '?' + querystring.encode(req.qs))),
            chalk.gray('(') +
            chalk[colorForSpeed(elapsed)](elapsed + 'ms') +
            chalk.gray(')')
        );

        if (responseLogger)
            responseLogger(_.pick(res, 'method', 'url', 'header', 'qs'));
    });
}

function getStatus(res) {
    let status = res.status;
    if (status < 300) {
        status = chalk.green(status);
    } else if (status < 400) {
        status = chalk.yellow(status);
    } else {
        status = chalk.red(status);
    }
    return status;
}

function colorForSpeed(ms) {
    if (ms < 200) {
        return 'green';
    } else if (ms < 1000) {
        return 'gray';
    } else if (ms < 5000) {
        return 'yellow';
    } else {
        return 'red';
    }
}

function rightPad(str, len) {
    const l = str.length;
    if (l < len) {
        let i = 0;
        const n = len - l;
        for (; i < n; i++) {
            str += ' ';
        }
    }
    return str;
}