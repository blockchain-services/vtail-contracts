//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/interfaces/IERC721.sol";

import "./ITokenSale.sol";

///
/// @dev Interface for the NFT Royalty Standard
///
interface IVTailERC721 is IERC721, IMintableToken {
    // OpenSEA proxy registry
    function setProxyRegistryAddress(address valu) external;
    function proxyRegistryAddress() external view returns (address);
    // base tokewn URI
    function setBaseTokenURI(string memory _baseU) external;
    function baseTokenURI() external view returns (string memory);

    // utility - checks if user owns the given tokens
    function owns(address owner, uint256[] memory tokenIds) external view returns (bool[] memory);
    // utility - return all token owners
    function allTokenHashes() external view returns (uint256[] memory);
}
