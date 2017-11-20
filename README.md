# crowdsale-api

This is a service for generating and deploying ICO smart contract.

1. install dependencies

```
npm install
```

2. install oracle-combine dependencies

```
npm run postinstall
```

3. start service

```
node app.js
```

4. create token via create token api

```
URL: localhost:3000/token
Method: POST
Body:
{
  "name" : "FacetCoin",
  "symbol": "FCT"
}
```

5. create crowdsale plan.

```
URL: localhost:3000/crowdsale
Method: POST
Body:
{
  "tokenId" : "1vwUa4MsQa",
  "startTime": "2011-11-13T16:48:00.000Z",
  "endTime": "2011-11-23T14:48:00.000Z",
  "baseRate": 100,
  "wallet": "0x00552A8D44860f1b7fa514fC34606B49D60BDD25"
  
}
```
6. Running a parity node 

```
 parity --chain ropsten --bootnodes "enode://20c9ad97c081d63397d7b685a412227a40e23c8bdc6688c6f37e97cfbc22d2b4d1db1510d8f61e6a8866ad7f0e17c02b14182d37ea7c3c8b9c2683aeb6b733a1@52.169.14.227:30303,enode://6ce05930c72abc632c58e2e4324f7c7ea478cec0ed4fa2528982cf34483094e9cbc9216e7aa349691242576d552a2a56aaeae426c5303ded677ce455ba1acd9d@13.84.180.240:30303" --unlock 0x00552A8D44860f1b7fa514fC34606B49D60BDD25 --password ./.safe/password.txt --geth
 ```
