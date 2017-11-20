const path = require('path');
const fs = require('fs-extra');

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
    console.log('contract dir', ifExist);

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
    console.log('merge dir', ifExist);

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
   console.log('Token file output_path: ' + TOKEN_FILE_PATH);
   let success =  await fs.writeFile(TOKEN_FILE_PATH, newTokenContract, 'utf8')
   console.log('write token file:', success);
}

exports.buildCrowdsaleContract = async function (tokenId) {

    console.log('Building crowdsale contracts');
    let CROWDSALE_TEMPLATE_PATH = path.join(TEMPLATE_DIR_NAME, '/', CROWDSALE_TEMPLATE_NAME)
    let crowdsaleFileContent = await fs.readFile(CROWDSALE_TEMPLATE_PATH, 'utf8');

    let CROWDSALE_FILE_PATH = path.join(BUILD_DIR_NAME, '/', tokenId, '/', CONTRACT_DIR_NAME,'/', CROWDSALE_FILE_NAME);
    console.log('Crowdsale file output_path: ', CROWDSALE_FILE_PATH);
    let success = await fs.writeFile(CROWDSALE_FILE_PATH, crowdsaleFileContent, 'utf8');
    console.log('write crowdsale file:', success);

};

exports.mergeCrowdsaleContract = async function (tokenId) {

    console.log('Merging crowdsale contracts');

    let PWD = __dirname;

    const ORACLES_COMBINE_DIR_PATH = path.join(PWD , '/../node_modules/oracles-combine-solidity');
    const ORACLES_COMBINE_OUT_DIR_PATH = path.join(ORACLES_COMBINE_DIR_PATH, '/out');

    const BUILD_DIR_PATH = path.join(PWD, '/../.build');
    const MERGE_DIR_PATH = path.join(PWD, '/../.build/', tokenId, '/', MERGE_DIR_NAME);

    const shell = require('shelljs');
    shell.cd(ORACLES_COMBINE_DIR_PATH);

    let CROWDSALE_FILE_PATH = path.join(BUILD_DIR_PATH, '/', tokenId, '/', CONTRACT_DIR_NAME,'/', CROWDSALE_FILE_NAME);
    console.log(CROWDSALE_FILE_PATH);
    if (shell.exec('npm start ' + CROWDSALE_FILE_PATH).code !== 0) {
        shell.echo('Error: merge file failed');
        shell.exit(1);
    } else {
        shell.mv(ORACLES_COMBINE_OUT_DIR_PATH + '/CrowdSale_flat.sol',  path.join(MERGE_DIR_PATH, '/', CROWDSALE_FILE_NAME));
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
    console.log('tokenId', tokenId);

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

    console.log(startTime);
    console.log(endTime);
    const contractInstance = contract.new(
        // crowdSaleParams.startTime,
        // crowdSaleParams.endTime,
        startTime,
        endTime,
        crowdSaleParams.baseRate,
        // 100,
        // crowdSaleParams.wallet,
        web3.eth.accounts[0],
        {
            data: '0x' + bytecode,
            from: web3.eth.coinbase,
            gas: 4000000
        }, (err, crowdRes) => {
            if (err) {
                console.log(err);
                return;
            }

            // Log the tx, you can explore status with eth.getTransaction()
            console.log(crowdRes.transactionHash);
            // console.log('res:', res);

            // If we have an address property, the contract was deployed
            if (crowdRes.address) {
                console.log('Contract address: ' + crowdRes.address);
                // Let's test the deployed contract
                // Reference to the deployed contract
                var address = crowdRes.address
                const crowdsaleInstance = contract.at(address);
                crowdsaleInstance.token.call({ gas: 3000000 }, (err, tokenRes) => {
                    if (err) {
                        console.log(err);
                        return;
                    }
                    console.log('Token deployed');
                    console.log(tokenRes);

                    var tokenAddress = {};
                    tokenAddress.CrowdSaleContractAddress = crowdRes.address;
                    tokenAddress.TokenContractAddress = tokenRes;
                    res.send(tokenAddress);
                });
            }
        });

}