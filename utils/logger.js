const winston = require('winston');

const createLogger = () => new (winston.Logger)({
  transports: [
    new (winston.transports.Console)(),
    new winston.transports.File({ filename: 'log/crowdsale-api.log' })
  ],
});

const logger = createLogger();

module.exports = logger;