var fs = require('fs');
var path = require('path');

const buildFolder = '../../build';

exports.build = function name(tokenId) {
    // let tokenId = req.body.tokenId;
    // let 
    
    let Token = Parse.Object.extend('Token');  
    let tokenQuery = new Parse.Query(Token);

    tokenQuery.equalTo("objectId", tokenId);
    return tokenQuery.first({
        success: function(Token){
            let token = Token.toJSON();
            console.log(token);

            let tokenTemplate = "templates/Token.template";
            let tokenFile = "Token.sol";

            let crowdSaleTemplate = "templates/CrowdSale.template";
            let crowdSaleFile = "CrowdSale.sol";

            var buildDir = buildFolder; //'./build';
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
                // var contractDir = './build/contracts';
                var contractDir = path.join(buildFolder, 'contracts');

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
                // var contractDir = './build/contracts';
                var contractDir = path.join(buildFolder, 'contracts');
                console.log(contractDir);
                if (!fs.existsSync(contractDir)) {
                    fs.mkdirSync(contractDir);
                }

                fs.writeFile(contractDir + '/' + crowdSaleFile, data, 'utf8', function (err) {
                    if (err) return console.log(err);
                });
            });
            // res.send('template replaced.');
            return 'template replaced';
        },
        error: function (e) {
            console.log('error: ' + e.message);
            // res.status = 403;
        }
    });
    
}