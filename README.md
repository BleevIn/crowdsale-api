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
