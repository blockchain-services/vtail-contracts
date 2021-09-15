const { ethers } = require("hardhat");
const { expect } = require("chai");

describe("Token Sale Test Suite", function () {
	let tokenSale;
	let erc721;
	let purchaser;
	let minter;
    
	beforeEach(async () => {
		[minter, purchaser] = await ethers.getSigners();

		// Deploying the VTailERC721 Contract for Token Sale Usage
		const TestERC721 = await ethers.getContractFactory("VTailERC721");
		erc721 = await TestERC721.deploy(minter.address, "VTailERC721", "VT721", 5000, "http://test");
		await erc721.deployed();

		const TokenSale = await ethers.getContractFactory("TokenSale");
		tokenSale = await TokenSale.deploy(erc721.address, 50, 5000, 100);
		await tokenSale.deployed();

	});

	it("It Should an allow account to purchase", async function () {
		//Set Token Sale status before purchasing/minting
		await tokenSale.setOpenState(true);
		await tokenSale.mint(minter.address, 1);

		// Make sure to purchase not more than the available minter. 
		await tokenSale.purchase(purchaser.address, 1, {
			value: ethers.utils.parseEther('1')
		});

		const purchaserList = await tokenSale.purchaserList();
		expect(purchaserList[0].recipient).to.be.equal(purchaser.address);
	})

	it("It Should't an allow purchase more than the available minter", async function () {
		//Set Token Sale status before purchasing/minting
		await tokenSale.setOpenState(true);
		await tokenSale.mint(minter.address, 1);

		// Make sure to purchase not more than the available minter. 
		await expect(tokenSale.purchase(purchaser.address, 2, {
			value: ethers.utils.parseEther('1')
		})).to.be.revertedWith("Cannot purchase more than the available minter");


	})
})