//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/interfaces/IERC165.sol";
import "./Controllable.sol";
import "./ITokenSale.sol";
import "hardhat/console.sol";
/// tokensale implementation
contract TokenSale is ITokenSale, Controllable {

    address payee;
    address soldToken;
    uint256 salePrice_;
    uint256 issueCount;
    uint256 maxCount;
    uint256 vipReserve;
    uint256 vipIssued;

    TokenMinting[] _purchasers;
    TokenMinting[] _mintees;

    address _partner;
    uint256 _permill;

    bool _openState;

    /// @notice Called to purchase some quantity of a token
    /// @param _soldToken - the erc721 address
    /// @param _salePrice - the sale price
    /// @param _maxCount - the max quantity
    /// @param _vipReserve - the vip reserve to set aside for minting directly
    constructor(address _soldToken, uint256 _salePrice, uint256 _maxCount, uint256 _vipReserve) {
        require(Controllable(_soldToken).isController(address(this)), "soldToken must be controllable by this contract");
        _addController(msg.sender);
        payee = msg.sender;
        soldToken = _soldToken;
        salePrice_ = _salePrice;
        issueCount = 0;
        maxCount = _maxCount;
        vipReserve = _vipReserve;
        vipIssued = 0;
    }

    /// @dev create a token hash using the address of this objcet, sender address and the current issue count
    function _createTokenHash() internal view returns (uint256) {
        return uint256(keccak256(abi.encodePacked(address(this), msg.sender, issueCount)));
    }

    /// @notice Called to purchase some quantity of a token
    /// @param receiver - the address of the account receiving the item
    /// @param quantity - the quantity to purchase. max 5. 
    function purchase(address receiver, uint256 quantity) external payable override returns (TokenMinting[] memory mintings) {
        require(issueCount + quantity + vipReserve <= maxCount, "cannot purchase more than maxCount");
        require(salePrice_ * quantity <= msg.value, "must attach funds to purchase items");
        require(quantity > 0 && quantity <= 5, "cannot purchase more than 5 items");
        require(_openState, "cannot mint when tokensale is closed");

        // mint the desired tokens to the receiver
        mintings = new TokenMinting[](quantity);
        for(uint256 i = 0; i < quantity; i++) {
            // create a record of this new minting
            _purchasers.push(TokenMinting(receiver, _createTokenHash()));
            // and get a refence to it
            mintings[i] = _purchasers[_purchasers.length - 1];
            issueCount = issueCount + 1;
            // emit an event to that respect
            emit TokenSold(receiver, _mintees[i].tokenHash);
        }

        uint256 partnerShare = 0;
        // transfer to partner share
        if(_partner != address(0) && _permill > 0) {
            partnerShare = msg.value * _permill / 1000000;
            payable(_partner).transfer(partnerShare);
        }
        uint256 ourShare = msg.value - partnerShare; 
        payable(payee).transfer(ourShare);
    }

    /// @notice returns the sale price in ETH for the given quantity.
    /// @param quantity - the quantity to purchase. max 5. 
    /// @return price - the sale price for the given quantity
    function salePrice(uint256 quantity) external view override returns (uint256 price) {
        price = salePrice_ * quantity;
    }

    /// @notice Mint a specific tokenhash to a specific address ( up to har-cap limit)
    /// only for controller of token
    /// @param receiver - the address of the account receiving the item
    /// @param tokenHash - token hash to mint to the receiver
    function mint(address receiver, uint256 tokenHash) external override onlyController {
        require(vipIssued < vipReserve, "cannot mint more than the reserve");
        require(issueCount < maxCount, "cannot mint more than maxCount");
        vipIssued = vipIssued + 1;
        issueCount = issueCount + 1;
        _mintees.push(TokenMinting(receiver, _createTokenHash()));
        Mintable(soldToken).mint(receiver, tokenHash);
    }

    /// @notice set the revenue partner on this tokensale. we split revenue with the partner
    /// only for controller of token
    /// @param partner - the address of the partner. will receive x%% of the revenue
    /// @param permill - permilliage of the revenue to be split. min 0 max 1000000
    function setRevenuePartner(address partner, uint256 permill) external override onlyController {
        require(permill >= 0 && permill <= 1000000, "permill must be between 0 and 1000000");
        _partner = partner;
        _permill = permill;
        emit RevenuePartnerChanged(partner, permill);
    }

    /// @notice get the revenue partner on this tokensale. we split revenue with the partner
    /// @return partner - the address of the partner. will receive x%% of the revenue
    /// @return permill - permilliage of the revenue to be split. permill = 1 / 1000000
    function getRevenuePartner() external view override returns (address partner, uint256 permill) {
        return (_partner, _permill);
    }

    /// @notice open / close the tokensale
    /// only for controller of token
    /// @param openState - the open state of the tokensale
    function setOpenState(bool openState) external override onlyController {
        _openState = openState;
    }

    /// @notice get the token sale open state
    /// @return openState - the open state of the tokensale
    function getOpenState() external view override returns (bool openState) {
        openState = _openState;
    }

    /// @notice set the psale price
    /// only for controller of token
    /// @param _salePrice - the open state of the tokensale
    function setSalePrice(uint256 _salePrice) external override onlyController {
        require(salePrice_ > 0, "salePrice must be greater than 0");
        salePrice_ = _salePrice;
    }

    /// @notice get the token sale price
    /// @return salePrice - the open state of the tokensale
    function getSalePrice() external view  override returns (uint256) {
        return salePrice_;
    }

    /// @notice set the psale price
    /// only for controller of token
    /// @param _payee - the open state of the tokensale
    function setPayee(address _payee) external override onlyController {
        require(_payee != address(0), "payee cannoot be zero address");
        payee = _payee;
        emit PayeeChanged(payee);
    }

    /// @notice get the token sale price
    /// @return salePrice - the open state of the tokensale
    function getPayee() external view  override returns (address) {
        return payee;
    }

    /// @notice get the address of the sole token
    /// @return token - the address of the sole token
    function getSaleToken() external view override returns (address token) {
        return soldToken;
    }

    /// @notice get the total list of purchasers
    /// @return _list - total list of purchasers
    function purchaserList() external view override returns (TokenMinting[] memory _list) {
        _list = _purchasers;
    }

    /// @notice get the total list of minters
    /// @return _list - total list of purchasers
    function minterList() external view override returns (TokenMinting[] memory _list) {
        _list = _mintees;
    }
}
