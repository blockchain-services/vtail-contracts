// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import hre from 'hardhat';
const {ethers, deployments} = hre;
const {get} = deployments;
const {Contract} = ethers;
import {pack, keccak256} from '@ethersproject/solidity';

export default async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the signer
  const [sender] = await hre.ethers.getSigners();

  // get the Gem pools contract
  const NFTGemPoolFactory = await hre.ethers.getContractAt(
    'NFTGemPoolFactory',
    (await hre.ethers.get('NFTGemPoolFactory')).address,
    sender
  );
}
