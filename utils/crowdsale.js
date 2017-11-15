const path = require('path');
const fs = require('fs');
const fse = require('fs-extra');

const Parse = require('parse/node');
Parse.initialize('ICO-API-DEV');
Parse.serverURL = 'https://facetcoin-api-dev.herokuapp.com/parse';

const BUILD_PATH = '.build';
const CONTRACT_DIR = '/contracts';

const TOKEN_TEMPLATE = "./templates/Token.template";
const TOKEN_FILE_NAME = "Token.sol";

const CROWDSALE_TEMPLATE = "./templates/CrowdSale.template";
const CROWDSALE_FILE_NAME = "CrowdSale.sol";

exports.newCrowdsale = function (options) {
    let args = options || {};

    let tokenId = args.tokenId;
    let startString = args.startTime;
    let endString = args.endTime;
    let baseRate = args.baseRate;
    let wallet = args.wallet;

    let CrowdSale = Parse.Object.extend('CrowdSale');
    let newCrowdSale = new CrowdSale();

    var startTemp = new Date(startString);
    var startEpoch = startTemp.getTime() / 1000;
    var endTemp = new Date(endString);
    var endEpoch = endTemp.getTime() / 1000;

    console.log('start epoch:', startEpoch);
    console.log('end epoch:', endEpoch);

    newCrowdSale.set('tokenId', tokenId);
    newCrowdSale.set('startEpoch', startEpoch);
    newCrowdSale.set('endEpoch', endEpoch);
    newCrowdSale.set('baseRate', baseRate);
    newCrowdSale.set('wallet', wallet);

    return newCrowdSale.save(null, {
        success: function (newCrowdSale) {
            console.log(newCrowdSale);
            return 'new Crowd Sale saved';
        },
        error: function (e) {
            console.log('error: ' + e.message);
            throw (e);
            // return res.status = 403;
        }
    });
};

exports.buildContracts = async function (tokenId) {

    // replace token file with toke meta info
    // let tokenId = req.body.tokenId;

    let Token = Parse.Object.extend('Token');
    let tokenQuery = new Parse.Query(Token);


    // var contractDir = './build';
    let contractDir = path.join(BUILD_PATH, tokenId, CONTRACT_DIR);
    console.log(contractDir);
    fse.pathExists(contractDir)
        .then(() => {
            console.log('Folder created, cleaning up the folders');
            fse.emptyDir(contractDir);
        })
        .catch(err => {
            console.error(err);
            throw (err);
        });

    // if (!fs.existsSync(contractDir)) {
    //     console.log('Creating new folders');
    //     await fs.mkdirSync(contractDir);
    // } else {
    //     console.log('Replacing folders');
    //     var shell = require('shelljs');
    //     await shell.rm('-r', contractDir);
    //     await fs.mkdirSync(contractDir);
    // }

    console.log('Creating token contracts');
    tokenQuery.equalTo("objectId", tokenId);
    let tokenJson = await tokenQuery.first({
        success: async function (Token) {
            let token = Token.toJSON();
            console.log(token);

            // let tokenTemplate = "templates/Token.template";
            // let tokenFile = "Token.sol";

            // let crowdSaleTemplate = "templates/CrowdSale.template";
            // let crowdSaleFile = "CrowdSale.sol";

            // await fse.readFile(TOKEN_TEMPLATE, 'utf8', async function (err, data) {
            //     if (err) {
            //         return console.log(err);
            //     }
            //     var nameResult = data.replace(/token_name_placeholder/g, token.name);
            //     var result = nameResult.replace(/token_symbol_placeholder/g, token.symbol);
            //     // var contractDir = './build/contracts';
            //     console.log('in token template ' + contractDir);
            //     if (!fse.existsSync(contractDir)) {
            //         fse.mkdirSync(contractDir);
            //     }

            //     let output_path = path.join(contractDir, TOKEN_FILE_NAME); //contractDir + '/' + TOKEN_FILE_NAME
            //     console.log('in token template output_path: ' + output_path);
            //     await fse.writeFile(output_path, result, 'utf8', function (err) {
            //         if (err) return console.log(err);
            //     });
            // });

            await fse.readFile(CROWDSALE_TEMPLATE, 'utf8', async function (err, data) {
                if (err) {
                    return console.log(err);
                }
                // var contractDir = './build/contracts';
                console.log('in crowdsale template' + contractDir);
                if (!fse.existsSync(contractDir)) {
                    fse.mkdirSync(contractDir);
                }

                let output_path = path.join(contractDir, CROWDSALE_FILE_NAME); //contractDir + '/' + crowdSaleFile
                console.log('in crowdsale template output_path: ' + output_path);
                await fs.writeFile(output_path, data, 'utf8', function (err) {
                    if (err) return console.log(err);
                });
            });
            // res.send('template replaced.');
            console.log('before return ');
            // return 'Contracts built';
        },
        error: function (e) {
            console.log('error: ' + e.message);
            throw (e);
            // res.status = 403;
        }
    });

    let token = tokenJson.toJSON();
    console.log('before craete token ' + output_path);
    await fse.readFile(TOKEN_TEMPLATE, 'utf8')
        .then(async function (err, data) {
            if (err) {
                return console.log(err);
            }
            var nameResult = data.replace(/token_name_placeholder/g, token.name);
            var result = nameResult.replace(/token_symbol_placeholder/g, token.symbol);
            // var contractDir = './build/contracts';
            console.log('in token template ' + contractDir);
            // !fse.existsSync(contractDir).then(() => {
            //     fse.mkdirSync(contractDir);
            // })

            let output_path = path.join(contractDir, TOKEN_FILE_NAME); //contractDir + '/' + TOKEN_FILE_NAME
            console.log('in token template output_path: ' + output_path);
            await fse.writeFile(output_path, result, 'utf8')
                .then().catch(err => {
                    if (err) return console.log(err);
                });
        });
    console.log('before end');
};