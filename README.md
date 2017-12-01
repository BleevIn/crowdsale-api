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
## async contract deployment
./resource/deployJobService will spawn new child process which simply runs 
```
node deployment.js [deploy_id]
```
where [deploy_id] is obtained by calling POST /deploy. While the deployment on going, you can monitor status column of ContractDeployment table


