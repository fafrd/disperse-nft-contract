# Disperse NFT

This contract allows you to send many ERC-1155 NFTs in a single transaction. This is be useful for airdropping many NFTs in a gas-efficient manner.

This is intended for NFT contracts that support multiple copies of the same NFT, such as Rarible multiples, or Curio Cards.

Developed with Hardhat, compiled with solidity 0.8.4.

## Usage

Frontend: https://github.com/fafrd/disperse-nft-web

Ethereum deployment: [0xb26E9fF02fc659738C4A2888e0Ed58FF0b7C2763](https://etherscan.io/address/0xb26e9ff02fc659738c4a2888e0ed58ff0b7c2763)<br>
Rinkeby deployment: [0x7b194fBF78eeb62044985d37c9c4cDF6F4f0CA28](https://rinkeby.etherscan.io/address/0x7b194fBF78eeb62044985d37c9c4cDF6F4f0CA28)<br>
Polygon deployment: [0x219E5cE7B2667a2Bd07C583DEAF5731e64b02cF6](https://polygonscan.com/address/0x219E5cE7B2667a2Bd07C583DEAF5731e64b02cF6)<br>
Mumbai deployment: [0x4Dc10B9c07DC00A6af5F8441324B8429D1e2C043](https://mumbai.polygonscan.com/address/0x4dc10b9c07dc00a6af5f8441324b8429d1e2c043)

## How it works

The contract is very simple, see [contracts/Disperse.sol](contracts/Disperse.sol). The contract does some safety checking, then iterates over `token.safeBatchTransferFrom` for each `recipient`.

The function `disperse` takes 5 parameters:
- `IERC1155 token`: Address of an ERC-1155 NFT contract to send from.
- `address[] recipients`: Array of addresses of recipients.
- `uint256[] ids`: Array of NFT token IDs, if you are sending multiple different IDs to each recipient.
- `uint256[] values`: Array of quantities of each ID to send to each recipient.
- `bytes data`: Optional data passed along to safeBatchTransferFrom.

For example, if you wanted to send [this Rarible NFT](https://rinkeby.rarible.com/token/0x2ebecabbbe8a8c629b99ab23ed154d74cd5d4342:110285?tab=owners) to many people at once, you would provide the following:
- `IERC1155 token`: `0x2ebecabbbe8a8c629b99ab23ed154d74cd5d4342` (Rarible erc-1155 contract address)
- `address[] recipients`: `[0x5295b474F3A0bB39418456c96D6FCf13901A4aA1, 0x53D42b9A7C8d727c193eaE6E1465D808191E00B5]` (2 recipients)
- `uint256[] ids`: `[110285]` (token ID in contract - taken from URL)
- `uint256[] values`: `[3]` (3 copies of each ID to each recipient)
- `bytes data`: `0x`

## Developing

### Compile

    npx hardhat compile

### Run tests

    npx hardhat test

#### Develop and test interactively using fswatch

    fswatch test/test.js contracts/Disperse.sol | xargs -n1 -I{} npx hardhat test

## Deploy to testnet/mainnet

Adjust hardhat.config.js as necessary for rinkeby, mainnet etc, then run

    node scripts/deploy.js
