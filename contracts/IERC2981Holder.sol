//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/interfaces/IERC165.sol";

///
/// @dev interface for a holder (owner) of an ERC2981-enabled token
/// @dev to modify the fee amount as well as transfer ownership of
/// @dev royalty to someone else.
///
interface IERC2981Holder {

    function setFee(uint256 _id, uint256 _fee) external;
    function getFee(uint256 _id) external returns (uint256);

    function royaltyOwner(uint256 _id) external returns (address);
    function transferOwnership(uint256 _id, address _newOwner) external;

}
