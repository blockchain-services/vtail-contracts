//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";

/**
 * @title ERC20 contract for VTail.com
 * @dev see  [EIP-20: Basic token standard]
 *
 * @dev ERC20 contract for VTail.com. contract params passed into constructor.
 * @dev see  [EIP-20: Basic token standard]. inherit from ERC20Pausable 
 * @dev to support pause/unpause
 */
contract VTailERC20 is ERC20Pausable {

    // the owner address. The owner can pause/unpause the contract
    address private owner;

    // added to methods that should only be called by the owner
    modifier onlyOwner {
        // only the owner shall pass
        require(msg.sender == owner, 
            "Only the owner can perform this action");
        _;
    }
    
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
        owner = _owner;
    }

    /**
    * @dev pause all token sends
    */
    function pause() public onlyOwner {
        _pause();
    }

    /**
    * @dev unpause all token sends
    */
    function unpause() public onlyOwner {
        _unpause();
    }
}