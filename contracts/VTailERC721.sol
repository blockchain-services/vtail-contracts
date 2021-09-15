//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./Controllable.sol";

import "./ERC2981.sol";
import "hardhat/console.sol";

contract OwnableDelegateProxy {}

contract ProxyRegistry {
    mapping(address => OwnableDelegateProxy) public proxies;
}

/**
 * @title ERC721 contract for VTail.com
 * @dev see  [EIP-20: Basic token standard]
 */
contract VTailERC721 is ERC721, ERC2981, Ownable, Controllable {
    // the base URI for URI calls
    string private _baseUri;

    // the proxy registry address
    address proxyRegistryAddress;

    // the minter of this token - it is minted on demand
    address private minter;

    // the max quantity that can be minted
    uint256 private mintingMax;

    // the max quantity that can be minted
    uint256 private nextHashValue;

    /**
     * @dev Initializes the contract with the minter, the mintingMax and the total supply.
     * @param _minter the address of the minter
     * @param name the token name
     * @param symbol the token symbol
     * @param _mintingMax the total number of tokens  to be minted
     * @param _uri the base uri for the token
     */
    constructor(
        address _minter, 
        string memory name, 
        string memory symbol, 
        uint256 _mintingMax, 
        string memory _uri) ERC721(name, symbol) {
            // set the minter and mintinx max
            minter = _minter;
            mintingMax = _mintingMax;
            _baseUri = _uri;
            nextHashValue = 1;
    }

    /**
     * @dev mint an NFT of the given id to the target address
     * @return totalSupply the total supply of the token
     */
    function _totalSupply() public view returns (uint256 totalSupply) {
        totalSupply = nextHashValue - 1;
    }

    /**
     * @dev mint an NFT of the given id to the target address
     * @param _to the address of the minter
     */
    function mint(address _to) public {
        // require that caller be the minter. only the minter can mint
        require(msg.sender == minter, "Only the minter can mint");
        // require that less than mintingMax tokens have been minted
        require(_totalSupply() <= mintingMax, "Minting max reached");
        // set the initial royalty receiver to the receiver of the token
        royaltyReceiversByHash[nextHashValue] = _to;
        // mint the token
        _mint(_to, nextHashValue);
        // increment the hash value
        nextHashValue++;
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

    /**
     * Override isApprovedForAll to whitelist user's OpenSea proxy accounts 
     * to enable gas-less listings.
     */
    function isApprovedForAll(address owner, address operator)
        override
        public
        view
        returns (bool)
    {
        // Whitelist OpenSea proxy contract for easy trading.
        ProxyRegistry proxyRegistry = ProxyRegistry(proxyRegistryAddress);
        if (address(proxyRegistry.proxies(owner)) == operator) {
            return true;
        }

        return super.isApprovedForAll(owner, operator);
    }

    /// @notice the base token URI
    /// @return baseUri - the base URI
    function baseTokenURI() 
        virtual 
        public 
        view returns (string memory baseUri) {
        baseUri = _baseUri;
    }

    /// @notice the base token URI
    function setBaseTokenURI(string memory _baseU) 
        virtual 
        public onlyOwner {
        _baseUri = _baseU;
    }

    /// @notice the base token URI
    /// @param _tokenId - the interface id to check
    /// @return _tokenUri - the token  URI
    function tokenURI(uint256 _tokenId) 
        override 
        public 
        view returns (string memory _tokenUri) {
        _tokenUri = string(
            abi.encodePacked(baseTokenURI(), Strings.toString(_tokenId))
        );
    }

}