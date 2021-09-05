//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title ERC20 contract for VTail.com
 * @dev see  [EIP-20: Basic token standard]
 *
 * @dev ERC20 contract for VTail.com. contract params passed into constructor.
 */
contract VTailERC20 is ERC20 {

    /**
    * @dev see  [EIP-20: Basic token standard]
    */
    constructor(
        address _owner, 
        string memory name, 
        string memory symbol, 
        uint256 _totalSupply) ERC20(name, symbol) {
        // mint the total supply to the owner
        _mint(_owner, _totalSupply);
    }

}