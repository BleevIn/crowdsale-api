const path = require('path');
const fs = require('fs-extra');
const log = require('../utils/logger.js')

const BUILD_DIR_NAME = '.build';
const CONTRACT_DIR_NAME = 'contracts';
const MERGE_DIR_NAME = 'merged';
const TEMPLATE_DIR_NAME = 'templates';

const TOKEN_TEMPLATE_NAME = "Token.template";
const CROWDSALE_TEMPLATE_NAME = "CrowdSale.template";

const TOKEN_FILE_NAME = "Token.sol";
const CROWDSALE_FILE_NAME = "CrowdSale.sol";

exports.makeBuildDir = async function(tokenId) {
    let BUILD_DIR_PATH = path.join(BUILD_DIR_NAME, '/', tokenId);
    let ifExist = await fs.pathExists(BUILD_DIR_PATH);
   if(ifExist) {
        await fs.emptyDir(BUILD_DIR_PATH);
    }
    else {
        await fs.ensureDir(BUILD_DIR_PATH);
    }
}

exports.prepContractDir = async function(tokenId) {
    let CONTRACT_DIR_PATH = path.join(BUILD_DIR_NAME, '/', tokenId, '/', CONTRACT_DIR_NAME);
    let ifExist = await fs.pathExists(CONTRACT_DIR_PATH);
    log.info('contract dir', ifExist);

    if(ifExist) {
        await fs.emptyDir(CONTRACT_DIR_PATH);
    }
    else {
        await fs.ensureDir(CONTRACT_DIR_PATH);
    }
}

exports.prepMergeDir = async function(tokenId) {
    let MERGE_DIR_PATH = path.join(BUILD_DIR_NAME, '/', tokenId, '/', MERGE_DIR_NAME);
    let ifExist = await fs.pathExists(MERGE_DIR_PATH);
    log.info('merge dir', ifExist);

    if(ifExist) {
        await fs.emptyDir(MERGE_DIR_PATH);
    }
    else {
        await fs.ensureDir(MERGE_DIR_PATH);
    }
}

exports.buildTokenContract = async function (tokenId, name, symbol) {

   let TOKEN_TEMPLATE_PATH= path.join(TEMPLATE_DIR_NAME, '/', TOKEN_TEMPLATE_NAME)
   let tokenFileContent = await fs.readFile(TOKEN_TEMPLATE_PATH, 'utf8');

   var nameResult = tokenFileContent.replace(/token_name_placeholder/g, name);
   var newTokenContract = nameResult.replace(/token_symbol_placeholder/g, symbol);

   let TOKEN_FILE_PATH = path.join(BUILD_DIR_NAME, '/', tokenId, '/', CONTRACT_DIR_NAME,'/', TOKEN_FILE_NAME);
   log.info('Token file output_path: ' + TOKEN_FILE_PATH);
   let success =  await fs.writeFile(TOKEN_FILE_PATH, newTokenContract, 'utf8')
   log.info('write token file:', success);
}

exports.buildCrowdsaleContract = async function (tokenId) {

    log.info('Building crowdsale contracts');
    let CROWDSALE_TEMPLATE_PATH = path.join(TEMPLATE_DIR_NAME, '/', CROWDSALE_TEMPLATE_NAME)
    let crowdsaleFileContent = await fs.readFile(CROWDSALE_TEMPLATE_PATH, 'utf8');

    let CROWDSALE_FILE_PATH = path.join(BUILD_DIR_NAME, '/', tokenId, '/', CONTRACT_DIR_NAME,'/', CROWDSALE_FILE_NAME);
    log.info('Crowdsale file output_path: ', CROWDSALE_FILE_PATH);
    let success = await fs.writeFile(CROWDSALE_FILE_PATH, crowdsaleFileContent, 'utf8');
    log.info('write crowdsale file:', success);

};

exports.mergeCrowdsaleContract = async function (tokenId) {

    log.info('Merging crowdsale contracts');

    let PWD = __dirname;

    const ORACLES_COMBINE_DIR_PATH = path.join(PWD , '/../node_modules/oracles-combine-solidity');
    const ORACLES_COMBINE_OUT_DIR_PATH = path.join(ORACLES_COMBINE_DIR_PATH, '/out');

    const BUILD_DIR_PATH = path.join(PWD, '/../.build');
    const MERGE_DIR_PATH = path.join(PWD, '/../.build/', tokenId, '/', MERGE_DIR_NAME);

    const shell = require('shelljs');

    let CROWDSALE_FILE_PATH = path.join(BUILD_DIR_PATH, '/', tokenId, '/', CONTRACT_DIR_NAME,'/', CROWDSALE_FILE_NAME);
    log.info(CROWDSALE_FILE_PATH);
    let npmRes = shell.exec('npm start --prefix '+ ORACLES_COMBINE_DIR_PATH + ' ' + CROWDSALE_FILE_PATH);
    if (npmRes.code !== 0) {
       log.error('oracle compbine npm install failed');
       throw new Error("failed to merge contract");
    } else {
        let mvRes = shell.mv(ORACLES_COMBINE_OUT_DIR_PATH + '/CrowdSale_flat.sol',  path.join(MERGE_DIR_PATH, '/', CROWDSALE_FILE_NAME));
        if (mvRes.code !== 0) {
            log.error('failed to move merged file');
            throw new Error("failed to merge contract");
        }
    }

};

compileContract = function(contractFilePath){
    const solc = require('solc');
    const input = fs.readFileSync(contractFilePath);
    return  solc.compile(input.toString(), 1);
}

getMergeDirPath = function(tokenId) {
    let PWD = __dirname;
    return  path.join(PWD, '/../.build/', tokenId, '/', MERGE_DIR_NAME);
}

getTimeDuration = function(){
    return {
        seconds: function (val) { return val },
        minutes: function (val) { return val * this.seconds(60) },
        hours: function (val) { return val * this.minutes(60) },
        days: function (val) { return val * this.hours(24) },
        weeks: function (val) { return val * this.days(7) },
        years: function (val) { return val * this.days(365) }
    };
}

exports.deployCrowdsaleContract = async function (tokenId, crowdsale) {
    // Compile the source code
    log.info('tokenId', tokenId);
    log.info('crowdSale metadata is: ', crowdsale);

    let contractFilePath = path.join(getMergeDirPath(tokenId), '/', CROWDSALE_FILE_NAME); 
    let output = compileContract(contractFilePath);

    const bytecode = output.contracts[':TokenCrowdsale'].bytecode;
    const abi = JSON.parse(output.contracts[':TokenCrowdsale'].interface);
    const tokenAbi = JSON.parse(output.contracts[':Token'].interface);


    // Connect to local Ethereum node
    const Web3 = require('web3');
    const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

    // Contract object
    const contract = web3.eth.contract(abi);
    const tokenContract = web3.eth.contract(tokenAbi);

    const duration =  getTimeDuration();

    startTime = web3.eth.getBlock('latest').timestamp + duration.minutes(9);
    endTime = startTime + duration.weeks(1);

    log.info(startTime);
    log.info(endTime);
    const crowdRes = await contract.new(
        // crowdsale.startTime,
        // crowdsale.endTime,
        startTime,
        endTime,
        crowdsale.baseRate,
        // crowdsale.wallet,
        web3.eth.accounts[0],
        {
            data: '0x' + bytecode,
            from: web3.eth.coinbase,
            gas: 4000000
        });
    // Log the tx, you can explore status with eth.getTransaction()
    log.info(crowdRes.transactionHash);

    // If we have an address property, the contract was deployed
    var tokenAddress = {};
    tokenAddress.CrowdSaleContractAddress = crowdRes.address;
    if (crowdRes.address) {
        log.info('Contract address: ' + crowdRes.address);
        // Let's test the deployed contract
        // Reference to the deployed contract
        var address = crowdRes.address
        const crowdsaleInstance = contract.at(address);
        let tokenRes = await crowdsaleInstance.token.call({ gas: 3000000 });
        log.info('Token deployed');
        log.info(tokenRes);
        tokenAddress.TokenContractAddress = tokenRes;
        // res.send(tokenAddress);
        log.info('contract address is:', tokenAddress);
        
    }
    return tokenAddress;
}