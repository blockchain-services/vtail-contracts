import {HardhatRuntimeEnvironment} from 'hardhat/types';

import {task} from 'hardhat/config';

import {readFileSync, writeFileSync} from 'fs';

import 'dotenv/config';
import {HardhatUserConfig} from 'hardhat/types';

import 'hardhat-deploy';
import 'hardhat-deploy-ethers';
import 'hardhat-spdx-license-identifier';
import 'hardhat-contract-sizer';
import 'hardhat-abi-exporter';
import 'hardhat-gas-reporter';
import 'hardhat-typechain';
import 'hardhat-watcher';

import '@nomiclabs/hardhat-waffle';
import '@nomiclabs/hardhat-solhint';
import '@nomiclabs/hardhat-ganache';
import '@nomiclabs/hardhat-ethers';
import '@nomiclabs/hardhat-etherscan';

import {node_url, accounts} from './utils/network';

// open the tokensale. Once the tokensale is open, anyone can buy tokens
task('open-tokensale', 'open the tokensale').setAction(
  async ({}, hre: HardhatRuntimeEnvironment) => {
    const [sender] = await hre.ethers.getSigners();
    const tokenSale = await hre.ethers.getContractAt(
      'TokenSale',
      (
        await hre.deployments.get('TokenSale')
      ).address,
      sender
    );
    const tx = await tokenSale.setOpenState(true);
    await tx.wait();
  }
);

// close the tokensale. Once the tokensale is closed, nobody can buy tokens
task('close-tokensale', 'close the tokensale').setAction(
  async ({}, hre: HardhatRuntimeEnvironment) => {
    const [sender] = await hre.ethers.getSigners();
    const tokenSale = await hre.ethers.getContractAt(
      'TokenSale',
      (
        await hre.deployments.get('TokenSale')
      ).address,
      sender
    );
    const tx = await tokenSale.setOpenState(true);
    await tx.wait();
  }
);

task('get-tokensale-openstate', 'get the open/close state of the tokensale').setAction(
  async ({}, hre: HardhatRuntimeEnvironment) => {
    const [sender] = await hre.ethers.getSigners();
    const tokenSale = await hre.ethers.getContractAt(
      'TokenSale',
      (
        await hre.deployments.get('TokenSale')
      ).address,
      sender
    );
    const tx = await tokenSale.getOpenState();
    console.log({
      openSatate: tx
    })
  }
);


// set the revenue partner address and the percentage of their revenue share
task('set-revenue-partner', 'set the revenue partner address and permil cut')
  .addParam('address', 'The revenue partner address')
  .addParam('cut', 'Their permillion cut of revenue (1000 permillion = 1 percent)')
  .setAction(
  async ({address, cut}, hre: HardhatRuntimeEnvironment) => {
    const [sender] = await hre.ethers.getSigners();
    const tokenSale = await hre.ethers.getContractAt(
      'TokenSale',
      (
        await hre.deployments.get('TokenSale')
      ).address,
      sender
    );
    const tx = await tokenSale.setRevenuePartner(address, cut);
    await tx.wait();
  }
);

// set the revenue partner address and the percentage of their revenue share
task('get-revenue-partner', 'get the revenue partner address and permil cut')
  .setAction(
  async ({}, hre: HardhatRuntimeEnvironment) => {
    const [sender] = await hre.ethers.getSigners();
    const tokenSale = await hre.ethers.getContractAt(
      'TokenSale',
      (
        await hre.deployments.get('TokenSale')
      ).address,
      sender
    );
    const tx = await tokenSale.getRevenuePartner();
    console.log({
      address: tx[0],
      cut: tx[1]
    });
  }
);

// set the sale price for the token sale
task('set-sale-price', 'set the sale price of the token sale')
  .addParam('price', 'The price in satoshi (1000000000000000000 satoshi equals one ether)')
  .setAction(
  async ({price}, hre: HardhatRuntimeEnvironment) => {
    const [sender] = await hre.ethers.getSigners();
    const tokenSale = await hre.ethers.getContractAt(
      'TokenSale',
      (
        await hre.deployments.get('TokenSale')
      ).address,
      sender
    );
    const tx = await tokenSale.setSalePrice(price);
    await tx.wait();
  }
);

// set the revenue partner address and the percentage of their revenue share
task('get-sale-price', 'get the sale price of the token sale')
  .setAction(
  async ({}, hre: HardhatRuntimeEnvironment) => {
    const [sender] = await hre.ethers.getSigners();
    const tokenSale = await hre.ethers.getContractAt(
      'TokenSale',
      (
        await hre.deployments.get('TokenSale')
      ).address,
      sender
    );
    const tx = await tokenSale.getSalePrice();
    console.log({
      salePrice: tx.toHexString(),
    });
  }
);

// set the revenue partner address and the percentage of their revenue share
task('get-sale-token', 'get the sale token address')
  .setAction(
  async ({}, hre: HardhatRuntimeEnvironment) => {
    const [sender] = await hre.ethers.getSigners();
    const tokenSale = await hre.ethers.getContractAt(
      'TokenSale',
      (
        await hre.deployments.get('TokenSale')
      ).address,
      sender
    );
    const tx = await tokenSale.getSaleToken();
    console.log({
      token: tx,
    });
  }
);

// purchase one or more items from the token sale
task('purchase', 'purchase one or more items from the token sale')
  .addParam('receiver', 'The address of the receiver')
  .addParam('quantity', 'The quantity to purchase')
  .setAction(
  async ({receiver, quantity}, hre: HardhatRuntimeEnvironment) => {
    const [sender] = await hre.ethers.getSigners();
    const tokenSale = await hre.ethers.getContractAt(
      'TokenSale',
      (
        await hre.deployments.get('TokenSale')
      ).address,
      sender
    );
    // look up the sale token price then call purchase
    // with the correct value for the quantity
    const sp = await tokenSale.getSalePrice();
    const tx = await tokenSale.purchase(receiver, quantity, {
      value: sp.mul(quantity)
    });
    await tx.wait();
  }
);

// purchase one or more items from the token sale
task('mint', 'mint a token with a specific hash to a receiving address')
  .addParam('receiver', 'The address of the receiver of the mint')
  .addParam('hash', 'The hash of the token to mint')
  .setAction(
  async ({receiver, hash}, hre: HardhatRuntimeEnvironment) => {
    const [sender] = await hre.ethers.getSigners();
    const tokenSale = await hre.ethers.getContractAt(
      'TokenSale',
      (
        await hre.deployments.get('TokenSale')
      ).address,
      sender
    );
    // call mint to mint a token with a specific hash
    const tx = await tokenSale.mint(receiver, hash);
    await tx.wait();
  }
);

task('set-payee', 'set the payee for the token sale')
  .addParam('address', 'The payee address for the token sale')
  .setAction(
  async ({address}, hre: HardhatRuntimeEnvironment) => {
    const [sender] = await hre.ethers.getSigners();
    const tokenSale = await hre.ethers.getContractAt(
      'TokenSale',
      (
        await hre.deployments.get('TokenSale')
      ).address,
      sender
    );
    const tx = await tokenSale.setPayee(address);
    await tx.wait();
  }
);

// get the payee for the token sale
task('get-payee', 'get the payee for the token sale')
  .setAction(
  async ({}, hre: HardhatRuntimeEnvironment) => {
    const [sender] = await hre.ethers.getSigners();
    const tokenSale = await hre.ethers.getContractAt(
      'TokenSale',
      (
        await hre.deployments.get('TokenSale')
      ).address,
      sender
    );
    const tx = await tokenSale.getPayee();
    console.log({
      address: tx
    });
  }
);

// get the payee for the token sale
task('get-minter-list', 'get the minter list for the token sale')
  .setAction(
  async ({}, hre: HardhatRuntimeEnvironment) => {
    const [sender] = await hre.ethers.getSigners();
    const tokenSale = await hre.ethers.getContractAt(
      'TokenSale',
      (
        await hre.deployments.get('TokenSale')
      ).address,
      sender
    );
    const tx = await tokenSale.minterList();
    console.log({
      minters: tx
    });
  }
);

// get the payee for the token sale
task('get-purchaser-list', 'get the purchaser list for the token sale')
  .setAction(
  async ({}, hre: HardhatRuntimeEnvironment) => {
    const [sender] = await hre.ethers.getSigners();
    const tokenSale = await hre.ethers.getContractAt(
      'TokenSale',
      (
        await hre.deployments.get('TokenSale')
      ).address,
      sender
    );
    const tx = await tokenSale.purchaserList();
    console.log({
      purchasers: tx
    });
  }
);

task('add-controller', 'add a controller to the token sale')
  .addParam('address', 'The controller address')
  .setAction(
  async ({address}, hre: HardhatRuntimeEnvironment) => {
    const [sender] = await hre.ethers.getSigners();
    const tokenSale = await hre.ethers.getContractAt(
      'TokenSale',
      (
        await hre.deployments.get('TokenSale')
      ).address,
      sender
    );
    const tx = await tokenSale.addControllers(address);
    await tx.wait();
  }
);


const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: '0.8.0',
        settings: {
          optimizer: {
            enabled: true,
            runs: 2222,
          },
        },
      },
      {
        version: '0.6.6',
        settings: {
          optimizer: {
            enabled: true,
            runs: 2222,
          },
        },
      },
      {
        version: '0.5.16',
        settings: {
          optimizer: {
            enabled: true,
            runs: 2200,
          },
        },
      },
    ],
  },
  namedAccounts: {
    deployer: {
      default: 0,
      kovan: 0,
    },
  },

  networks: {
    hardhat: {
      chainId: 1337,
      accounts: accounts(),
    },
    localhost: {
      url: 'http://localhost:8545',
      accounts: accounts(),
      gasPrice: 'auto',
      gas: 'auto',
    },
    mainnet: {
      url: node_url('mainnet'),
      accounts: accounts('mainnet'),
      gasPrice: 'auto',
      gas: 'auto',
      gasMultiplier: 1.5,
    },
    rinkeby: {
      url: node_url('rinkeby'),
      accounts: accounts('rinkeby'),
      gasPrice: 'auto',
      gas: 'auto',
    },
    ropsten: {
      url: node_url('ropsten'),
      accounts: accounts('ropsten'),
      gasPrice: 'auto',
      gas: 'auto',
    },
    kovan: {
      url: node_url('kovan'),
      accounts: accounts('kovan'),
      gasPrice: 'auto',
      gas: 'auto',
    },
    staging: {
      url: node_url('kovan'),
      accounts: accounts('kovan'),
      gasPrice: 'auto',
      gas: 'auto',
    },
    ftmtest: {
      url: node_url('ftmtest'),
      accounts: accounts('ftmtest'),
      gasPrice: 'auto',
      gas: 'auto',
    },
    opera: {
      url: node_url('opera'),
      accounts: accounts('opera'),
      timeout: 30000,
    },
    sokol: {
      url: node_url('sokol'),
      accounts: accounts('sokol'),
      gasPrice: 'auto',
      gas: 'auto',
    },
    fuji: {
      url: node_url('fuji'),
      accounts: accounts('fuji'),
      gasPrice: 'auto',
      gas: 'auto',
    },
    avax: {
      url: node_url('avax'),
      accounts: accounts('avax'),
      gasPrice: 'auto',
      gas: 'auto',
    },
    binance: {
      url: node_url('binance'),
      accounts: accounts('binance'),
      gasPrice: 'auto',
      gas: 'auto',
    },
    bsctest: {
      url: node_url('bsctest'),
      accounts: accounts('bsctest'),
      gasPrice: 'auto',
      gas: 'auto',
    },
    poa: {
      url: node_url('poa'),
      accounts: accounts('poa'),
      gasPrice: 'auto',
      gas: 'auto',
    },
  },
  etherscan: {
    apiKey: '4QX1GGDD4FPPHK4DNTR3US6XJDFBUXG7WQ',
  },
  paths: {
    sources: 'src',
  },
  gasReporter: {
    currency: 'USD',
    gasPrice: 150,
    enabled: true,
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
    maxMethodDiff: 10,
  },
  mocha: {
    timeout: 0,
  },
  abiExporter: {
    path: './build',
    clear: true,
    flat: true,
  },
  typechain: {
    outDir: './types',
    target: 'ethers-v5',
  },
};

export default config;
