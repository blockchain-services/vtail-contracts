//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

import "./ERC2981.sol";

/**
 * @title ERC721 contract for VTail.com
 * @dev see  [EIP-20: Basic token standard]
 */
contract VTailERC721 is ERC721, ERC2981 {

    // the minter of this token - it is minted on demand
    address private minter;

    // the max quantity that can be minted
    uint256 private mintingMax;

    /**
     * @dev Initializes the contract with the minter, the mintingMax and the total supply.
     * @param _minter the address of the minter
     * @param name the maximum number of tokens that can be minted
     * @param symbol the total number of tokens in existence
     * @param symbol the total number of tokens in existence
     */
    constructor(
        address _minter, 
        string memory name, 
        string memory symbol, 
        uint256 _mintingMax) ERC721(name, symbol) {
            // set the minter and mintinx max
            minter = _minter;
            mintingMax = _mintingMax;
    }

    /**
     * @dev mint an NFT of the given id to the target address
     * @param _to the address of the minter
     * @param _id the maximum number of tokens that can be minted
     */
    function mint(address _to, uint256 _id) public {
        // require that caller be the minter. only the minter can mint
        require(msg.sender == minter, "Only the minter can mint");
        // set the initial royalty receiver to the receiver of the token
        royaltyReceiversByHash[_id] = _to;
        // mint the token
        _mint(_to, _id);
    }

    /// @notice ERC165 interface responder for this contract
    /// @param interfaceId - the interface id to check
    /// @return supportsIface - whether the interface is supported
    function supportsInterface(bytes4 interfaceId) 
        public 
        view 
        virtual 
        override(ERC2981, ERC721) returns (bool supportsIface) {
        supportsIface = interfaceId == type(IERC2981).interfaceId 
        || super.supportsInterface(interfaceId);
    }

}