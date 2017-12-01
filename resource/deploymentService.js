const Parse = require('parse/node');
const log = require('../utils/logger.js');
Parse.initialize('ICO-API-DEV');
Parse.serverURL = 'https://facetcoin-api-dev.herokuapp.com/parse';
const ContractDeployment = Parse.Object.extend('ContractDeployment');
const buildUtil = require('../utils/build');
const tokenService = require('./tokenService')();
const crowdsaleService = require('./crowdsaleService');
const request = require('request');

exports.registerDeployment = async function (options) {
    let args = options || {};

    let tokenId = args.tokenId;
    let callbackUrl = args.callbackUrl;
    let callbackAuthToken = args.callbackAuthToken;

    let deployment = new ContractDeployment();
    deployment.set('tokenId', tokenId);
    deployment.set('callbackUrl', callbackUrl);
    deployment.set('callbackAuthToken', callbackAuthToken);
    deployment.set('numTried', 0);
    LiveCycleUtil.registered(deployment);

    deployment = await deployment.save(null);
    let jsn = deployment.toJSON();
    return jsn
};


//start the deployment. Note this will be called by separated deployment.js process
exports.doDeploy = async function (deploymendId) {
    let deployment = await getById(deploymendId);
    if (!deployment) {
        log.error('found non-existing deployment id', deploymendId);
        return;
    }
    LiveCycleUtil.started(deployment);
    deployment.save();
    try {
        const tokenId = deployment.get('tokenId');
        await buildUtil.makeBuildDir(tokenId);
        await buildUtil.prepContractDir(tokenId);
        await buildUtil.buildCrowdsaleContract(tokenId);

        let tokenObject = await tokenService.getTokenByTokenId(tokenId);
        let tokenJSON = tokenObject.toJSON();

        let crowdsaleObject = await crowdsaleService.getCrowdsaleByTokenId(tokenId);
        let crowdsaleJSON = crowdsaleObject.toJSON();

        await buildUtil.buildTokenContract(tokenId, tokenJSON.name, tokenJSON.symbol);

        await buildUtil.prepMergeDir(tokenId);
        await buildUtil.mergeCrowdsaleContract(tokenId);
        let res = await buildUtil.deployCrowdsaleContract(tokenId, crowdsaleJSON);
        LiveCycleUtil.finished(deployment, res);
        await deployment.save();
        await clientCallback(deployment);
    } catch (e) {
        log.error('contract deployment failed', e);
        LiveCycleUtil.failed(deployment, e.message);
        await deployment.save();
    }
}

async function clientCallback(deployment) {
    let url = deployment.get('callbackUrl');
    let authToken = deployment.get('callbackAuthToken');
    if (!url) {
        return;
    }
    let jsn = deployment.toJSON();
    let option = {
        url: url,
        json: {
            deploymentId: jsn.objectId,
            status: jsn.status,
            transactionHash: jsn.transactionHash
        }
    };
    if (jsn.status == 'failed') {
        option.json.failureReason = jsn.failureReason;
    }
    if (authToken) {
        option.headers = {
            Authorization: authToken
        }
    }
    request.post(option, function optionalCallback(err) {
        if (err) {
            return log.error('client callback failed', err);
        }
        log.log('client callback successfull');
    });

}

exports.getDeploymentById = getById = async function(deploymendId) {
    const deploymentQuery = new Parse.Query(ContractDeployment);
    deploymentQuery.equalTo('objectId', deploymendId);
    return await deploymentQuery.first();
}

const LiveCycleUtil = {
        registered: function (deployment) {
            deployment.set('status', 'registered');
            deployment.set('createDate', new Date());
        },
        started: function (deployment) {
            deployment.set('status', 'started');
            deployment.set('updateDate', new Date());
        },
        failed: function (deployment, reason) {
            deployment.set('status', 'failed');
            deployment.set('failureReason', reason);
            deployment.set('updateDate', new Date());
        },
        finished: function (deployment, deployResult) {
            deployment.set('status', 'finished');
            deployment.set('updateDate', new Date());
            deployment.set('transactionHash', deployResult.transactionHash)
            deployment.set('CrowdSaleContractAddress', deployResult.tokenAddress.CrowdSaleContractAddress);
            deployment.set('TokenContractAddress', deployResult.tokenAddress.TokenContractAddress);
        }
};

