# crowdsale-api

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


