# Smart Contracts and Development environment for the erc721 token sale

## INSTALL

Deployed contract ABIs and addresses can be found in the `deployments` folder and also in the root of the project in the `kovan.json` , `ropsten.json` `rinkeby.json` files.

## INSTALL

```bash
yarn
```

make a copy of `.env.sample` to `.env` and fill in the requisite information

## TEST

```bash
yarn test
```
## CONTROLLING THE TOKENSALE

```bash
npx hardhat --network <network> <command> --<argname> <argvalue>
```

### Available commands

`open-tokensale` - open the tokensale (make it available to the public) 
`close-tokensale` - open the tokensale (make it available to the public) 
`set-revenue-partner` `address` `cut` - set the revenue partner 
`get-revenue-partner` - get the revenue partner 
`set-sale-price` `price` - set sale price in satoshi 
`get-sale-price` - get sale price in satoshi 
`get-sale-token` - get address of the 721 token being sold 
`purchase` `quantity` - purchase a quantity of the 721 
`mint` `receiver` `hash` - mint a token to receiver with given hash 
`get-minter-list` - get the list of all receivers of a mint 
`get-purchaser-list` - get the list of all purchasers of the tokensale 
`add-controller` `address` - add a controller to the tokensale 

## Github Setup

This include codechecks setup for gas report.
See guide here : https://github.com/cgewecke/hardhat-gas-reporter#continuous-integration

The repo code is setup for it. The only thing needed is setting up codecheks account and adding the repo to codechecks so you get a secret token

you ll need to set the github secret of the respective project added to codechecks.io. the secret name is: CC_SECRET (see .github/workflows/main.yml)

If you do not want gas report via codecheck you can remove `codechecks.yml` and `.github` and execute : `yarn remove @codechecks/client`
