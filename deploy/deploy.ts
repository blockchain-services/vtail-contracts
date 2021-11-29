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
      "The SD Test",
      "SDT",
      10000,
      "http://demonft.vtail.com/wp-json/api/token/"
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
      hre.ethers.utils.parseEther("0.03"),
      10000,
      100,
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
  console.log('initializing tokensale revenue partner');
  tx = await tokenSale.initialize(
    ownerAddress, // TODO this is the revenue partner address
    675000 // this is the revenue partner fee per million
  );
  await tx.wait();

  console.log('setting to open');
  tx = await tokenSale.setOpenState(true);
  await tx.wait();

  // we are done!
  console.log('Deploy complete\n');
};
func.tags = ['Deploy'];
