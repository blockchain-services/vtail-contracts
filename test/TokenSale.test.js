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

		const a = await erc721.addController(tokenSale.address);
		console.log(a);
		//Set Token Sale status before purchasing/minting
		await tokenSale.setOpenState(true);

	});

	it("It Should allow purchase", async function () {
		await tokenSale.mint(minter.address, 1);

		// Make sure to purchase not more than the available minter. 
		await tokenSale.purchase(purchaser.address, 1, {
			value: ethers.utils.parseEther('1')
		});

		const purchaserList = await tokenSale.purchaserList();
		expect(purchaserList[0].recipient).to.be.equal(purchaser.address);
	})

	it("It Should't allow purchase more than the available minter", async function () {
		await tokenSale.mint(minter.address, 1);

		// Trying to purchase more qty than the available minter. 
		await expect(tokenSale.purchase(purchaser.address, 2, {
			value: ethers.utils.parseEther('1')
		})).to.be.revertedWith("Cannot purchase more than the available minter");
	})
})