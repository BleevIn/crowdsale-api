var Parse = require('parse/node');
Parse.initialize('ICO-API-DEV');
Parse.serverURL = 'https://facetcoin-api-dev.herokuapp.com/parse';

const crowdsaleService = require('../resource/crowdsaleService');
const Token = Parse.Object.extend('Token');

exports.saveToken = async function (name, symbol) {
    let newToken = new Token();

    newToken.set('name', name);
    newToken.set('symbol', symbol);
    newToken.set('decimals', 18);

    return await newToken.save(null);
}

exports.getTokens = async function () {
    let tokenQuery = new Parse.Query(Token);
    return await tokenQuery.find();
}

exports.getTokenByTokenId = async function (tokenId) {
    var tokenQuery = new Parse.Query(Token);
    tokenQuery.equalTo('objectId', tokenId);
    return  await tokenQuery.first();
}

exports.getTokenDetail = async function (tokenId) {

    let token = await getTokenByTokenId(tokenId);
    let crowdSale = await crowdsaleService.getCrowdsaleByTokenId(tokenId);

    var tokenRes = {};
    tokenRes.token = token.toJSON();
    tokenRes.crowdSale = crowdSale.toJSON();

    return tokenRes;
}

