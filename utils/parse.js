var Parse = require('parse/node');
Parse.initialize('ICO-API-DEV');
Parse.serverURL = 'https://facetcoin-api-dev.herokuapp.com/parse';


exports.saveToken = function (name, symbol) {
    let Token = Parse.Object.extend('Token');
    let newToken = new Token();

    newToken.set('name', name);
    newToken.set('symbol', symbol);
    newToken.set('decimals', 18);

    return newToken.save(null, {
        success: function (newToken) {
            // res.send('new Token '+ name + ' saved');
            return newToken;
        }, 
        error: function (e) {
            console.log('error: ' + e.message);
            throw e;
        }
    });
}

