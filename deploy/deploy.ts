import 'hardhat-deploy-ethers';

export default async function func(hre: any) {

  const BigNumber = hre.ethers.BigNumber;
  const ethers = hre.ethers;
  const deployments = hre.deployments;
  const getContractAt = hre.ethers.getContractAt;
  const get = hre.deployments.get;
  const d = hre.deployments.deploy;
  const deploy = hre.deployments.deploy;

  console.log('VTail ERC721 deploy\n');

  const owner = await hre.ethers.getSigner();
  const ownerAddress = await owner.getAddress();


  // deploy NFT
  const erc721DeployParams = {
    from: ownerAddress,
    log: true,
    args: [
      "The NFT",
      "NFT",
      9999,
      "https://thenft.com/"
    ]
  };
  const VtailERC721 = await deploy(
    'VTailERC721',
    erc721DeployParams
  );
  let vtailERC721 = await getContractAt(
    'VTailERC721',
    ( await get('VTailERC721') ).address,
    owner
  )


  // deploy token sale
  const tokenSaleDeployParams = {
    from: ownerAddress,
    log: true,
    args: [
      vtailERC721.address,
      hre.ethers.utils.parseEther("1"),
      9999,
      25
    ]
  };
  const TokenSale = await deploy(
    'TokenSale',
    tokenSaleDeployParams
  );
  let tokenSale = await getContractAt(
    'TokenSale', ( await get('TokenSale') ).address,
    owner
  );


  // add token sale as controller of token
  console.log('setting token minter to tokensale');
  let tx = await vtailERC721.setMinter(tokenSale.address);
  await tx.wait();

  // init the contract
  console.log('initializing tokensale');
  tx = await tokenSale.initialize(ownerAddress, 9999);
  await tx.wait();

  // we are done!
  console.log('Deploy complete\n');
};
func.tags = ['Deploy'];
