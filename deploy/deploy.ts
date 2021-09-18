import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';

/**
 * @dev retrieve and display address, chain, balance
 */
const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  console.log('VTail ERC721 deploy\n');

  const [owner] = await hre.ethers.getSigners();
  const ownerAddress = await owner.getAddress();

  // deploy NFT
  const VTailERC721 = await hre.ethers.getContractFactory("VTailERC721");
  const vtailERC721 = await VTailERC721.deploy(
    "VTail NFT",
    "VTAIL",
    9999,
    "https://vtail.com/"
  );
  await vtailERC721.deployed();

  // deploy token sale
  const TokenSale = await hre.ethers.getContractFactory("TokenSale");
  const tokenSale = await TokenSale.deploy(
    vtailERC721.address,
    hre.ethers.utils.parseEther("1"),
    9999,
    25
  );
  await tokenSale.deployed();

  // add token sale as controller of token
  await vtailERC721.setMinter(tokenSale.address);

  // init the contract
  await tokenSale.initianplize(ownerAddress, 10000);

  // we are done!
  console.log('Deploy complete\n');
};

func.tags = ['Deploy'];
func.dependencies = [];
export default func;
