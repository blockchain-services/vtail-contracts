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

describe("VTail", function () {
  let tokenSale;
  let receiverAddress;
  let ownerAddress;
  let vtailERC721;
  let newPayeeAddress;
  let partnerAddress;

  beforeEach(async () => {
    const [owner, receiver, newPayee, partner] = await ethers.getSigners();
    ownerAddress = await owner.getAddress();
    receiverAddress = await receiver.getAddress();
    newPayeeAddress = await newPayee.getAddress();
    partnerAddress = await newPayee.getAddress();

    // deploy NFT
    const VTailERC721 = await ethers.getContractFactory("VTailERC721");
    vtailERC721 = await VTailERC721.deploy(
      "The NFT",
      "NFTT",
      9999,
      "https://thenft.com/"
    );
    await vtailERC721.deployed();

    // deploy token sale
    const TokenSale = await ethers.getContractFactory("TokenSale");
    tokenSale = await TokenSale.deploy(
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
  });

  it("Should conduct a successful token sale", async function () {
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

  it("Should be able to set new payee", async function () {
    // Set an address as a new payee
    await tokenSale.setPayee(newPayeeAddress);
    const payee = await tokenSale.getPayee();

    //Check new payee is already set anew.
    expect(payee).to.be.equal(newPayeeAddress);
  });

  it("Should be able to set new sale price", async function () {
    // Set a new sale price
    await tokenSale.setSalePrice(500);
    const price = await tokenSale.getSalePrice();
    // Check sale price is already updated or not.
    expect(price.toNumber()).to.be.equal(500);
  });

  it("Should be able to set revenue partner and it's share", async function () {
    // Set an address as the a partner
    await tokenSale.setRevenuePartner(partnerAddress, 50);
    const partner = await tokenSale.getRevenuePartner();

    //New partner should be changed
    expect(partner.partner).to.be.equal(partnerAddress);
    expect(partner.permill.toNumber()).to.be.equal(50);
  })
});
