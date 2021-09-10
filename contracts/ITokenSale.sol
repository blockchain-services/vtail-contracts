//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

///
/// @dev Interface for the NFT Royalty Standard
///
interface ITokenSale {

    /// @notice Called to purchase some quantity of a token
    /// @param receiver - the address of the account receiving the item
    /// @param quantity - the quantity to purchase. max 5. 
    function purchase(address receiver, uint256 quantity) external payable returns (TokenMinting[] memory mintings);

    /// @notice returns the sale price in ETH for the given quantity.
    /// @param quantity - the quantity to purchase. max 5. 
    /// @return price - the sale price for the given quantity
    function salePrice(uint256 quantity) external view returns (uint256 price);

    /// @notice Mint a specific tokenhash to a specific address ( up to har-cap limit)
    /// only for controller of token
    /// @param receiver - the address of the account receiving the item
    /// @param tokenHash - token hash to mint to the receiver
    function mint(address receiver, uint256 tokenHash) external;

    /// @notice set the revenue partner on this tokensale. we split revenue with the partner
    /// only for controller of token
    /// @param partner - the address of the partner. will receive x%% of the revenue
    /// @param permill - permilliage of the revenue to be split. min 0 max 1000000
    function setRevenuePartner(address partner, uint256 permill) external;

    /// @notice get the revenue partner on this tokensale. we split revenue with the partner
    /// @return partner - the address of the partner. will receive x%% of the revenue
    /// @return permill - permilliage of the revenue to be split. permill = 1 / 1000000
    function getRevenuePartner() external view returns (address , uint256);

    /// @notice open / close the tokensale
    /// only for controller of token
    /// @param openState - the open state of the tokensale
    function setOpenState(bool openState) external;

    /// @notice get the token sale open state
    /// @return openState - the open state of the tokensale
    function getOpenState() external view returns (bool);

    /// @notice set the psale price
    /// only for controller of token
    /// @param _salePrice - the open state of the tokensale
    function setSalePrice(uint256 _salePrice) external;

    /// @notice get the token sale price
    /// @return salePrice - the open state of the tokensale
    function getSalePrice() external view returns(uint256);


    /// @notice get the address of the sole token
    /// @return token - the address of the sole token
    function getSaleToken() external view returns(address);

    /// @notice get the primary token sale payee
    /// @return payee_ the token sale payee
    function getPayee() external view returns (address payee_);
    
    /// @notice set the primary token sale payee
    /// @param _payee - the token sale payee
    function setPayee(address _payee) external;

    /// @notice return the mintee list
    /// @return _list the token sale payee
    function minterList() external view returns (TokenMinting[] memory _list);

    /// @notice return the purchaser list
    /// @return _list the token sale payee
    function purchaserList() external view returns (TokenMinting[] memory _list);

    struct TokenMinting {
        address recipient;
        uint256 tokenHash;
    }

    event TokenSold(address indexed receiver, uint256 tokenHash);
    event PayeeChanged(address indexed receiver);
    event RevenuePartnerChanged(address indexed partner, uint256 permill);
}

interface Mintable {
    function mint(address receiver, uint256 tokenHash) external;
}
