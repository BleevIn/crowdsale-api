const tokenService = require('../resource/tokenService');
const crowdsaleService = require('../resource/crowdsaleService');

const buildUtil = require('../utils/build');

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
    app.post("/token", async function (req, res) {
        console.log(req.body);

        let name = req.body.name;
        let symbol = req.body.symbol;

        let newToken = await tokenService.saveToken(name, symbol);
        res.send('new token ' + name + ' saved');
    });

    /**
     * Get all tokens from Token table
     */
    app.get("/tokens", async function (req, res) {
        let tokens = await tokenService.getTokens();
        res.send(tokens);
    });

    /**
     * Get details info for single token
     */
    app.get("/token", async function (req, res) {
        var tokenId = req.query.id;
        let token = await tokenService.getTokenDetail(tokenId);
        res.send(token);
    });

    /**
     * Create a crowdSale
     */

    app.post("/crowdsale", async function (req, res) {
        let result = await crowdsaleService.newCrowdsale(req.body);
        res.send(result);
    });


    app.post("/deploy", async function (req, res) {
        let tokenId = req.body.tokenId; 
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
        await buildUtil.deployCrowdsaleContract(tokenId, crowdsaleJSON);

        res.send('deployed');
    });
}
module.exports = appRouter;