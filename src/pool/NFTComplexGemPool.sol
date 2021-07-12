// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/proxy/utils/Initializable.sol";

import "../interfaces/INFTGemMultiToken.sol";
import "../interfaces/INFTGemFeeManager.sol";
import "../interfaces/INFTComplexGemPool.sol";
import "../interfaces/INFTGemGovernor.sol";
import "../interfaces/ISwapQueryHelper.sol";
import "../interfaces/IERC3156FlashLender.sol";

import "../libs/AddressSet.sol";

import "./NFTComplexGemPoolData.sol";

contract NFTComplexGemPool is
    NFTComplexGemPoolData,
    INFTComplexGemPool,
    IERC3156FlashLender,
    ERC1155Holder
{
    using AddressSet for AddressSet.Set;
    using ComplexPoolLib for ComplexPoolLib.ComplexPoolData;

    /**
     * @dev Add an address allowed to control this contract
     */
    function addController(address _controllerAddress) external {
        require(
            poolData.controllers[msg.sender] == true ||
                address(this) == msg.sender,
            "Controllable: caller is not a controller"
        );
        poolData.controllers[_controllerAddress] = true;
    }

    /**
     * @dev Check if this address is a controller
     */
    function isController(address _controllerAddress)
        external
        view
        returns (bool)
    {
        return poolData.controllers[_controllerAddress];
    }

    /**
     * @dev Remove the sender's address from the list of controllers
     */
    function relinquishControl() external {
        require(
            poolData.controllers[msg.sender] == true ||
                address(this) == msg.sender,
            "Controllable: caller is not a controller"
        );
        delete poolData.controllers[msg.sender];
    }

    constructor() {
        poolData.controllers[msg.sender] = true;
    }

    /**
     * @dev initializer called when contract is deployed
     */
    function initialize(
        string memory _symbol,
        string memory _name,
        uint256 _ethPrice,
        uint256 _minTime,
        uint256 _maxTime,
        uint256 _diffstep,
        uint256 _maxClaims,
        address _allowedToken
    ) external override onlyController {
        poolData.pool = address(this);
        poolData.symbol = _symbol;
        poolData.name = _name;
        poolData.ethPrice = _ethPrice;
        poolData.minTime = _minTime;
        poolData.maxTime = _maxTime;
        poolData.diffstep = _diffstep;
        poolData.maxClaims = _maxClaims;
        poolData.visible = true;
        poolData.enabled = true;
        if (_allowedToken != address(0)) {
            poolData.allowedTokens.insert(_allowedToken);
        }
    }

    /**
     * @dev set the governor. pool uses the governor to issue gov token issuance requests
     */
    function setGovernor(address _governorAddress) external override {
        require(
            poolData.controllers[msg.sender] =
                true ||
                msg.sender == poolData.governor,
            "UNAUTHORIZED"
        );
        poolData.governor = _governorAddress;
    }

    /**
     * @dev set the fee tracker. pool uses the  fee tracker to issue  fee tracker token issuance requests
     */
    function setFeeTracker(address _feeTrackerAddress) external override {
        require(
            poolData.controllers[msg.sender] =
                true ||
                msg.sender == poolData.governor,
            "UNAUTHORIZED"
        );
        poolData.feeTracker = _feeTrackerAddress;
    }

    /**
     * @dev set the multitoken that this pool will mint new tokens on. Must be a controller of the multitoken
     */
    function setMultiToken(address _multiTokenAddress) external override {
        require(
            poolData.controllers[msg.sender] =
                true ||
                msg.sender == poolData.governor,
            "UNAUTHORIZED"
        );
        poolData.multitoken = _multiTokenAddress;
    }

    /**
     * @dev set the AMM swap helper that gets token prices
     */
    function setSwapHelper(address _swapHelperAddress) external override {
        require(
            poolData.controllers[msg.sender] =
                true ||
                msg.sender == poolData.governor,
            "UNAUTHORIZED"
        );
        poolData.swapHelper = _swapHelperAddress;
    }

    /**
     * @dev mint the genesis gems earned by the pools creator and funder
     */
    function mintGenesisGems(address _creatorAddress, address _funderAddress)
        external
        override
    {
        // security checks for this method are in the library - this
        // method  may only be  called one time per new pool creation
        poolData.mintGenesisGems(_creatorAddress, _funderAddress);
    }

    /**
     * @dev create a single claim with given timeframe
     */
    function createClaim(uint256 _timeframe) external payable override {
        poolData.createClaims(_timeframe, 1);
    }

    /**
     * @dev create multiple claims with given timeframe
     */
    function createClaims(uint256 _timeframe, uint256 _count)
        external
        payable
        override
    {
        poolData.createClaims(_timeframe, _count);
    }

    /**
     * @dev purchase gems
     */
    function purchaseGems(uint256 _count) external payable override {
        poolData.purchaseGems(msg.sender, msg.value, _count);
    }

    /**
     * @dev create a claim using a erc20 token
     */
    function createERC20Claim(address _erc20TokenAddress, uint256 _tokenAmount)
        external
        override
    {
        poolData.createERC20Claims(_erc20TokenAddress, _tokenAmount, 1);
    }

    /**
     * @dev create a claim using a erc20 token
     */
    function createERC20Claims(
        address _erc20TokenAddress,
        uint256 _tokenAmount,
        uint256 _count
    ) external override {
        poolData.createERC20Claims(_erc20TokenAddress, _tokenAmount, _count);
    }

    /**
     * @dev collect an open claim (take custody of the funds the claim is redeemable for and maybe a gem too)
     */
    function collectClaim(uint256 _claimHash, bool _requireMature)
        external
        override
    {
        poolData.collectClaim(_claimHash, _requireMature);
    }

    /**
     * @dev The maximum flash loan amount - 90% of available funds
     */
    function maxFlashLoan(address) external view override returns (uint256) {
        return address(this).balance - (address(this).balance / 10);
    }

    /**
     * @dev The flash loan fee - 0.1% of borrowed funds
     */
    function flashFee(address, uint256 amount)
        public
        pure
        override
        returns (uint256)
    {
        uint256 fee = 1000; // 0.1 %.
        return (amount * fee) / 10000;
    }

    /**
     * @dev Perform a flash loan (borrow tokens from the controller and return them after a certain time)
     */
    function flashLoan(
        IERC3156FlashBorrower receiver,
        address token,
        uint256 amount,
        bytes calldata data
    ) external override returns (bool) {
        uint256 fee = flashFee(token, amount);
        address receiverAddress = address(receiver);
        payable(receiverAddress).transfer(amount);
        uint256 remainBalance = address(this).balance;

        bytes32 CALLBACK_SUCCESS = keccak256(
            "ERC3156FlashBorrower.onFlashLoan"
        );
        require(
            receiver.onFlashLoan(msg.sender, token, amount, fee, data) ==
                CALLBACK_SUCCESS,
            "FlashMinter: Callback failed"
        );

        uint256 updatedBalance = address(this).balance;
        require(
            updatedBalance >= remainBalance * (amount + fee),
            "FlashMinter: Repay not approved"
        );

        return true;
    }
}
