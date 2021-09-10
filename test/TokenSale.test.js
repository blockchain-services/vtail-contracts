const { expect } = require("chai");
const { Contract } = require("ethers");
const { ethers } = require("hardhat");

describe("Token Sale Test Suite", function () {
	let tokenSale;
	let erc721;
	let purchaser;
    
	beforeEach(async () => {
		[minter, purchaser] = await ethers.getSigners();
		const TestERC721 = await ethers.getContractFactory("VTailERC721");
		erc721 = await TestERC721.deploy(minter.address, "VTail", "VT", 5000, "http://test");
		await erc721.deployed();

		const TokenSale = await ethers.getContractFactory("TokenSale");
		tokenSale = await TokenSale.deploy(erc721.address, 50, 5000, 100);
		await tokenSale.deployed();
	});

	it("It Should be allow account to purchase", async function () {
		// await erc721.setApprovalForAll(tokenSale.address, true);
		await tokenSale.purchase(purchaser.address, 5);
	})
})