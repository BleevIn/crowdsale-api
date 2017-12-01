
const deployServ = require('./resource/deploymentService');

if (process.argv.length < 3 || !process.argv[2]) {
    throw new Error('no deployment argument');
}

async function startDeploy() {
    const deployId = process.argv[2];
    await deployServ.doDeploy(deployId);
}

startDeploy();
