const { expect } = require("chai");
const { ethers } = require("hardhat");

/**
 * Parses transaction events from the logs in a transaction receipt
 * @param {TransactionReceipt} receipt Transaction receipt containing the events in the logs
 * @returns {{[eventName: string]: TransactionEvent}}
 */
function getTransactionEvent(contract, receipt, event) {
  for (const log of receipt.logs) {
    // for each event in the ABI
    for (const abiEvent of Object.values(contract.interface.events)) {
      // if the hash of the ABI event equals the tx receipt log
      if (abiEvent.topics[0] == log.topics[0] && aviEvent.name === "event") {
        // Parse the event from the log topics and data
        txEvents[abiEvent.name] = abiEvent.parse(log.topics, log.data);

        // stop looping through the ABI events
        break;
      }
    }
  }
  return;
}

describe("Greeter", function () {
  it("Should return the new greeting once it's changed", async function () {
    const [owner, receiver] = await ethers.getSigners();
    const ownerAddress = await owner.getAddress();
    const receiverAddress = await receiver.getAddress();

    // deploy NFT
    const VTailERC721 = await ethers.getContractFactory("VTailERC721");
    const vtailERC721 = await VTailERC721.deploy(
      "The NFT",
      "NFTT",
      9999,
      "https://thenft.com/"
    );
    await vtailERC721.deployed();

    // deploy token sale
    const TokenSale = await ethers.getContractFactory("TokenSale");
    const tokenSale = await TokenSale.deploy(
      vtailERC721.address,
      ethers.utils.parseEther("1"),
      9999,
      25
    );
    await tokenSale.deployed();

    // add token sale as controller of token
    await vtailERC721.setMinter(tokenSale.address);

    // init the contract
    await tokenSale.initialize(ownerAddress, 10000);

    // init the contract
    await tokenSale.setOpenState(true);

    // purchase an NFT to receiver (attaching 1 ETH as payment)
    const tokenMinting = await tokenSale.purchase(receiverAddress, 1, {
      value: ethers.utils.parseEther("1"),
    });
    const wReceipt = await tokenMinting.wait();

    // get the purchaser list
    const pList = await tokenSale.purchaserList();
    expect(pList).to.not.be.null;

    // get the latest minted token hash
    const pVal = pList[0][1].toHexString();

    // get reipient balance for returned NFT hash
    const ownerOf = await vtailERC721.owns(receiverAddress, [pVal]);
    expect(ownerOf[0]).to.be.true;
  });
});
