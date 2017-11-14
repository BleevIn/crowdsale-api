var Parse = require('parse/node');
Parse.initialize('ICO-API-DEV');
Parse.serverURL = 'https://facetcoin-api-dev.herokuapp.com/parse';

Web3 = require('web3');
// var web3 = new Web3(Web3.givenProvider || "http://localhost:8545");

// Connect to local Ethereum node
const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

const solc = require('solc');

var fs = require('fs')

var appRouter = function (app) {
    /**
     * Sample test api
     */
    app.get("/", function (req, res) {
        res.send("Hello World");
    });
   
    /**
    * Create a token
    */
    app.post("/token", function (req, res) {
        console.log(req);
        console.log(req.body);
        // console.log(req.key);
        let name = req.body.name;
        let symbol = req.body.symbol;
        // let key = req.body.key;

        let Token = Parse.Object.extend('Token');
        let newToken = new Token();

        newToken.set('name', name);
        newToken.set('symbol', symbol);
        newToken.set('decimals', 18);
        
        newToken.save(null, {
            success: function (newToken) {
                res.send('new Token '+ name + ' saved');
            },
            error: function (e) {
                console.log('error: ' + e.message);
                res.status = 403;
                // return res;
            }
        });
    });

    /**
     * Get all tokens from Token table
     */
    app.get("/tokens", function (req, res) {
        let Token = Parse.Object.extend('Token');
        var query = new Parse.Query(Token);
        query.find({
          success: function(results) {
            // results is an array of Parse.Object.
            console.log(results);
            res.send(results);
          },
        
          error: function(e) {
            // error is an instance of Parse.Error.
            console.log('error: ' + e.message);
            res.status = 403;
          }
        });
    });

        /**
     * Get details info for single token
     */
    app.get("/token", function (req, res) {

        var tokenId = req.query.id;
        console.log(tokenId);
        let Token = Parse.Object.extend('Token');
        
        var tokenQuery = new Parse.Query(Token);
        
        var tokenRes = {};

        tokenQuery.equalTo('objectId', tokenId);
        tokenQuery.first({
          success: function(token) {
            // results is an array of Parse.Object.
            console.log(token);
           
            tokenRes = token.toJSON();

            let CrowdSale = Parse.Object.extend('CrowdSale');
            let crowdSaleQuery = new Parse.Query(CrowdSale);
            crowdSaleQuery.equalTo('tokenId', tokenId);
            crowdSaleQuery.first({
                success: function(crowdSale){
                    console.log(crowdSale);
                    console.log(tokenRes);
                    tokenRes.crowdSale = crowdSale.toJSON();
                    res.send(tokenRes);
                },

                error: function(e) {
                    console.log('error: ' + e.message);
                    res.status = 403;
                }
            });
          },
        
          error: function(e) {
            // error is an instance of Parse.Error.
            console.log('error: ' + e.message);
            res.status = 403;
          }
        });
    });

    /**
     * Create a crowdSale
     */

    app.post("/crowdsale", function (req, res) {
    
        console.log(req.body);
        // console.log(req.key);
        let tokenId = req.body.tokenId;
        let startString = req.body.startTime;
        let endString = req.body.endTime;
        let baseRate = req.body.baseRate;
        let wallet = req.body.wallet;
        // let key = req.body.key;

        let CrowdSale = Parse.Object.extend('CrowdSale');
        let newCrowdSale = new CrowdSale();

        var startTemp = new Date(startString);
        var startEpoch = startTemp.getTime()/1000; 
        var endTemp = new Date(endString);
        var endEpoch = endTemp.getTime()/1000;

        console.log('start epoch:', startEpoch);
        console.log('end epoch:', endEpoch);

        newCrowdSale.set('tokenId',tokenId);
        newCrowdSale.set('startEpoch', startEpoch);
        newCrowdSale.set('endEpoch', endEpoch);
        newCrowdSale.set('baseRate', baseRate);
        newCrowdSale.set('wallet', wallet);
        
        newCrowdSale.save(null, {
            success: function (newCrowdSale) {
                console.log(newCrowdSale);
                res.send('new Crowd Sale saved');
            },
            error: function (e) {
                console.log('error: ' + e.message);
                res.status = 403;
            }
        });
    });

    app.post("/build", function (req, res) {
        // TODO: remove build before

        // replace token file with toke meta info
        let tokenId = req.body.tokenId;

        let Token = Parse.Object.extend('Token');  
        let tokenQuery = new Parse.Query(Token);

        tokenQuery.equalTo("objectId", tokenId);
        tokenQuery.first({
            success: function(Token){
                let token = Token.toJSON();
                console.log(token);

                let tokenTemplate = "templates/Token.template";
                let tokenFile = "Token.sol";

                let crowdSaleTemplate = "templates/CrowdSale.template";
                let crowdSaleFile = "CrowdSale.sol";

                var buildDir = './build';
                console.log(buildDir);
                if (!fs.existsSync(buildDir)) {
                    fs.mkdirSync(buildDir);
                }
                
                fs.readFile(tokenTemplate, 'utf8', function (err,data) {
                    if (err) {
                      return console.log(err);
                    }
                    var nameResult = data.replace(/token_name_placeholder/g, token.name);
                    var result = nameResult.replace(/token_symbol_placeholder/g, token.symbol);
                    var contractDir = './build/contracts';
                    console.log(contractDir);
                    if (!fs.existsSync(contractDir)) {
                        fs.mkdirSync(contractDir);
                    }

                    fs.writeFile(contractDir + '/' + tokenFile, result, 'utf8', function (err) {
                       if (err) return console.log(err);
                    });
                });

                fs.readFile(crowdSaleTemplate, 'utf8', function (err,data) {
                    if (err) {
                      return console.log(err);
                    }
                    var contractDir = './build/contracts';
                    console.log(contractDir);
                    if (!fs.existsSync(contractDir)) {
                        fs.mkdirSync(contractDir);
                    }

                    fs.writeFile(contractDir + '/' + crowdSaleFile, data, 'utf8', function (err) {
                       if (err) return console.log(err);
                    });
                });
                res.send('template replaced.');
            },
            error: function (e) {
                console.log('error: ' + e.message);
                res.status = 403;
            }
        });
    });

    app.post("/merge", function (req, res) {
        // replace token file with toke meta info
        var buildDir = __dirname + '/../build';
        var crowdSaleFile = __dirname + '/../build/contracts/CrowdSale.sol';
        var oraclesComineDir = __dirname + '/../node_modules/oracles-combine-solidity';
        var outDir = oraclesComineDir + '/out';
        var mergedDir =  buildDir +'/merged';

        console.log(crowdSaleFile);
        var shell = require('shelljs');

        shell.cd(oraclesComineDir);
        if (shell.exec('npm start ' + crowdSaleFile).code !== 0) {
            shell.echo('Error: merge file failed');
            shell.exit(1);
        } else {
            // shell.mkdir(buildDir + '/merged');
            console.log(mergedDir);
            if (fs.existsSync(buildDir + '/merged')) {
                var prompt = require('prompt');

                console.log("Do you want to remove " + mergedDir);
                console.log("if yes, please input 'y' , or 'n' ");

                prompt.get(['input'], function (err, result) {
                    //
                    // Log the results.
                    //
                    console.log('Command-line input received:');
                    console.log('input: ' + result.input);

                    if ( result.input === 'y') {
                        console.log('remove out folder');
                        shell.rm('-r', mergedDir)
                        shell.mv('./out', mergedDir);
                        shell.mv(mergedDir + '/CrowdSale_flat.sol', buildDir + '/merged/CrowdSale.sol');
                        res.send('Successuly merged!')
                    }
                    else {
                        res.send('Merged stopped.')
                    }
                });
            }
            else {

                shell.mv('./out', mergedDir);
                shell.mv(mergediDir + '/CrowdSale_flat.sol', mergedDir + '/CrowdSale.sol');
                res.send('Successuly merged!')
            }
        }
        
    });

    app.post("/deploy", function(req, res) {
        // Compile the source code

        let tokenId = req.body.tokenId;
        
        console.log('tokenId', tokenId);


        // Deploy contract instance
        let CrowdSale = Parse.Object.extend('CrowdSale');  
        let crowdSaleQuery = new Parse.Query(CrowdSale);
        crowdSaleQuery.equalTo('tokenId',tokenId);

        crowdSaleQuery.first({

            success: function(crowdSale) {
                console.log(crowdSale.toJSON());

                // compile contract

                let crowdSaleParams = crowdSale.toJSON();

                var buildDir = __dirname + '/../build';
                var mergedDir =  buildDir +'/merged';
                var mergedFile =  mergedDir +'/CrowdSale.sol';
        
                const input = fs.readFileSync(mergedFile);
                const output = solc.compile(input.toString(), 1);
                // console.log(output);
                const bytecode = output.contracts[':TokenCrowdsale'].bytecode;
                const abi = JSON.parse(output.contracts[':TokenCrowdsale'].interface);
                const tokenAbi = JSON.parse(output.contracts[':Token'].interface);

        
                // console.log(abi);
        
                // Contract object
                const contract = web3.eth.contract(abi);
                const tokenContract = web3.eth.contract(tokenAbi);

                
                console.log(web3.eth.coinbase);
                console.log(web3.eth.accounts[0]);


                const duration = {
                    seconds: function (val) { return val },
                    minutes: function (val) { return val * this.seconds(60) },
                    hours: function (val) { return val * this.minutes(60) },
                    days: function (val) { return val * this.hours(24) },
                    weeks: function (val) { return val * this.days(7) },
                    years: function (val) { return val * this.days(365) }
                };

                startTime = web3.eth.getBlock('latest').timestamp + duration.minutes(7);
                endTime = startTime + duration.weeks(1);

                console.log(startTime);
                console.log(endTime);
            

                const contractInstance = contract.new(
                    // crowdSaleParams.startTime,
                    // crowdSaleParams.endTime,

                    startTime,
                    endTime,
                    // crowdSaleParams.baseRate,
                    100,
                    // crowdSaleParams.wallet,
                    web3.eth.accounts[0],
                    {
                    data: '0x' + bytecode,
                    from: web3.eth.coinbase,
                    // from: '0xc8276afa0a38774bbaa0533d6c77106bc4286d10', 
                    gas: 3000000
                }, (err, res) => {
                    if (err) {
                        console.log(err);
                        return;
                    }

                    // Log the tx, you can explore status with eth.getTransaction()
                    console.log(res.transactionHash);
                    // console.log('res:', res);

                    // If we have an address property, the contract was deployed
                    if (res.address) {
                        console.log('Contract address: ' + res.address);
                        // Let's test the deployed contract

                        // Reference to the deployed contract
                        var address = res.address
                        const crowdsaleInstance = contract.at(address);
                        crowdsaleInstance.token.call({gas: 3000000},(err, res) =>{
                            if (err) {
                                console.log(err);
                                return;
                            }
                            console.log('Token deployed');
                            console.log(res);   

                                       // // Destination account for test
                            const test_account = web3.eth.accounts[0];
                            console.log(test_account);
                        
                            // Call the transfer function
                            let transaction = {};
                            transaction.from = test_account;
                            transaction.to =  address;
                            transaction.value =web3.toWei(1, "ether");
                            
                            // transaction.gas = gas;
                            // transaction.gasPrice = gasPrice; 
                            console.log('transaction', transaction);
                            // web3.eth.sendTransaction(transaction, (err, res) => {
                            //     if (err) {
                            //         console.log(err);
                            //         return;
                            //     }
                            //     console.log(res);
                            // });
                            web3.eth.sendTransaction(transaction);

                        });
                        
             
                    }
                });
            },

            error: function(e){
                console.log('error: ' + e.message);
                res.status = 403;
            }
        });
    });


    // app.post("/deploy", function(req, res) {

    // });

   
}
module.exports = appRouter;