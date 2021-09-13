const { ethers } = require("hardhat");

describe("Token Sale Test Suite", function () {
	let tokenSale;
	let erc721;
	let purchaser;
	let minter;
    
	beforeEach(async () => {
		[minter, purchaser] = await ethers.getSigners();
		const TestERC721 = await ethers.getContractFactory("VTailERC721");
		erc721 = await TestERC721.deploy(minter.address, "VTailERC721", "VT721", 5000, "http://test");
		await erc721.deployed();
		await erc721.mint(minter.address);

		const TokenSale = await ethers.getContractFactory("TokenSale");
		console.log('1');
		tokenSale = await TokenSale.deploy(erc721.address, 50, 5000, 100);
		await tokenSale.deployed();
	});

	it("It Should an allow account to purchase", async function () {
		// await erc721.setApprovalForAll(tokenSale.address, true);
		await tokenSale.setOpenState(true);
		await tokenSale.mint(minter.address, 1);
		await tokenSale.purchase(purchaser.address, 5, {
			value: ethers.utils.parseEther('1')
		});
	})
})