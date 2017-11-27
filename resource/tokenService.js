var Parse = require('parse/node');
Parse.initialize('ICO-API-DEV');
Parse.serverURL = 'https://facetcoin-api-dev.herokuapp.com/parse';

const crowdsaleService = require('../resource/crowdsaleService');
const Token = Parse.Object.extend('Token');

var SaveToken = async function (name, symbol) {
    let newToken = new Token();

    newToken.set('name', name);
    newToken.set('symbol', symbol);
    newToken.set('decimals', 18);

    return await newToken.save(null);
}

var GetTokens = async function () {
    let tokenQuery = new Parse.Query(Token);
    return await tokenQuery.find();
}

var GetTokenByTokenId = async function (tokenId) {
    console.log(tokenId);
    var tokenQuery = new Parse.Query(Token);
    tokenQuery.equalTo('objectId', tokenId);
    return  await tokenQuery.first();
}

var GetTokenDetail = async function (tokenId) {

    let token = await GetTokenByTokenId(tokenId);
    let crowdSale = await crowdsaleService.getCrowdsaleByTokenId(tokenId);

    var tokenRes = {};
    tokenRes.token = token.toJSON();
    tokenRes.crowdSale = crowdSale.toJSON();

    return tokenRes;
}

module.exports = exports = function () {

    var _this = exports;

    _this.saveToken = SaveToken;
    _this.getTokens = GetTokens;
    _this.getTokenByTokenId = GetTokenByTokenId;
    _this.getTokenDetail = GetTokenDetail;

    return _this;
};