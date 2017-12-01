const log = require('../utils/logger.js');
const { spawn } = require('child_process');
const jobQueue = [];
const INTERVAL = 2000; //time interval to wait until next tick
const MAX_JOBS = 10; //TODO: configurable. max num of jobs running at same time
const path = require('path');
const appDir = path.dirname(require.main.filename);
const toobusy = require('toobusy-js');
const deploymentService = require('./deploymentService');

var running = 0;
exports.registerJob = async function(options) {
    let deployjsn = await deploymentService.registerDeployment(options);
    if (!deployjsn || !deployjsn.objectId) {
        throw new Error('failed to deploy')
    }
    jobQueue.push(deployjsn.objectId);
    return deployjsn;
}
exports.startLoop = function() {
    setInterval(function () {
        if (toobusy()) {
            return;
        }
        while (jobQueue.length > 0 && running < MAX_JOBS) {
            const deployId = jobQueue.shift();
            log.info('starting deployment child process', deployId);
            running ++;
            const child = spawn('node', ['deployment.js', deployId], {cwd: appDir});
            child.on('error', (err) => {
                log.error('child process deployment failed', err);
                running --;
            });
            child.on('close', (code) => {
                running --;
                if (code !== 0) {
                    log.error('child process deployment failed with code', code);
                } else {
                    log.info('child process deployment successed', code);
                }
            });
        }
    }, INTERVAL);
};


