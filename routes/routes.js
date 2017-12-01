const tokenService = require('../resource/tokenService')();
const crowdsaleService = require('../resource/crowdsaleService');
const log = require('../utils/logger.js')
const deployJobService = require('../resource/deployJobService');

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
        log.info(req.body);

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
        try {
            if (!tokenId) {
                res.status(422).send('missing tokenId');
                return;
            }
            let result = await deployJobService.registerJob(req.body);
            res.status(200).send({deploymentId: result.objectId, status: result.status});
        } catch (e) {
            res.status(500).send('deployment failed. ' + e.message);
        }
    });
}
module.exports = appRouter;