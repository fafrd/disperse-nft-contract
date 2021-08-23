//SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.0;

import "hardhat/console.sol";

interface IERC1155 {
    function safeBatchTransferFrom(address _from, address _to, uint256[] calldata _ids, uint256[] calldata _values, bytes calldata _data) external;
}

contract DisperseNft {
    function disperse(IERC1155 token, address[] calldata recipients, uint256[] calldata ids, uint256[] calldata values, bytes calldata data) public {
        console.log("Dispersing...");
        for (uint256 i = 0; i < recipients.length; i++) {
            console.log("dispersing %d", i);
            token.safeBatchTransferFrom(msg.sender, recipients[i], ids, values, data);
        }
    }
}
