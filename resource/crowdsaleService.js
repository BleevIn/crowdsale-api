const path = require('path');
const fs = require('fs');
const fse = require('fs-extra');
const Parse = require('parse/node');
Parse.initialize('ICO-API-DEV');
Parse.serverURL = 'https://facetcoin-api-dev.herokuapp.com/parse';

const CrowdSale = Parse.Object.extend('CrowdSale');

exports.newCrowdsale = async function (options) {
    let args = options || {};

    let tokenId = args.tokenId;
    let startString = args.startTime;
    let endString = args.endTime;
    let baseRate = args.baseRate;
    let wallet = args.wallet;

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

    return await newCrowdSale.save(null);
};

exports.getCrowdsaleByTokenId = async function (tokenId) {

    let crowdSaleQuery = new Parse.Query(CrowdSale);
    crowdSaleQuery.equalTo('tokenId', tokenId);
    return await crowdSaleQuery.first(); 
};
