// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import hre from 'hardhat'
const { ethers } = hre
const { deployments } = hre
import processEvents from '../lib/event-processor'

// this script implements a simple event scanner that listens to the
// `events emitted by the `TokenSale` contract. The script as-is will
// print the events to the console and needs to be customized to
// your needs.
async function main() {
  const [sender] = await hre.ethers.getSigners();
  const tokenSaleDeploy = await deployments.get('TokenSale');
  const tokenSaleAbi = tokenSaleDeploy.abi;
  const tokenSale = await hre.ethers.getContractAt(
    'TokenSale',
    tokenSaleDeploy.address,
    sender
  )
  // call processEvents to process the event
  processEvents(
    hre.ethers.provider,
    tokenSale,
    tokenSaleAbi,
    'TokenSold',
    [null, null],
    (receiver: string, tokenHash: string ) => {
      console.log('Token sold', receiver, tokenHash)
    }
  )
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => { })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
