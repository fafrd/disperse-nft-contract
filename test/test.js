const { expect } = require("chai");
const { ethers } = require("hardhat");

const ETH_NODE_URL = process.env.ETH_NODE_URL;
const curio_erc1155_abi = require("./curio1155-wrapper.abi.json");
const curio_erc1155_contract_addr = "0x73DA73EF3a6982109c4d5BDb0dB9dd3E3783f313";
const acct_w_existing_curio_balance = "0x8A591E12B71a8Ca156f79529c7e4A3c4997Af982";

async function resetFork() {
  await network.provider.request({
    method: "hardhat_reset",
    params: [
      {
        forking: {
          jsonRpcUrl: ETH_NODE_URL,
          blockNumber: 13090000,
        },
      },
    ],
  });
}

beforeEach(async function () {
  await resetFork();
});

describe("DisperseNft", function () {
  it("Should fail to disperse from a non-contract address", async function () {
    const Disperse = await ethers.getContractFactory("DisperseNft");
    const disperse = await Disperse.deploy();
    await disperse.deployed();

    const [localAccount1] = await ethers.getSigners();

    await expect(disperse
      .disperse(
        "0x0000000000000000000000000000000000000000",
        [localAccount1.getAddress()],
        [0],
        [1],
        "0x"
      )
    ).to.be.revertedWith("function call to a non-contract account");
  });

  it("Should fail without approval", async function () {
    const Disperse = await ethers.getContractFactory("DisperseNft");
    const disperse = await Disperse.deploy();
    await disperse.deployed();

    const [localAccount1, localAccount2] = await ethers.getSigners();

    // Impersonate account that has balance for contract curio_erc1155_contract_addr,
    // have them send tokens manually to localAccount1's address
    await ethers.provider.send('hardhat_impersonateAccount', [acct_w_existing_curio_balance]);
    const mainnetAccount = await ethers.provider.getSigner(acct_w_existing_curio_balance);

    const curioContract_mainnetAccount = await new ethers.Contract(curio_erc1155_contract_addr, curio_erc1155_abi, mainnetAccount);
    await curioContract_mainnetAccount.safeBatchTransferFrom(
      acct_w_existing_curio_balance,
      localAccount1.getAddress(),
      [1, 2],
      [3, 6],
      "0x"
     );

    const curioContract_localAccount1 = await new ethers.Contract(curio_erc1155_contract_addr, curio_erc1155_abi, localAccount1);

    // disperse from localAccount1 to localAccount2
    await expect(disperse
    .disperse(
        curio_erc1155_contract_addr,
        [localAccount2.getAddress()],
        [1, 2],
        [3, 6],
        "0x"
      )
    ).to.be.revertedWith("Sender has not approved disperse contract");
  });

  it("Should fail without sufficient balance", async function () {
    const Disperse = await ethers.getContractFactory("DisperseNft");
    const disperse = await Disperse.deploy();
    await disperse.deployed();

    const [localAccount1, localAccount2] = await ethers.getSigners();

    // Impersonate account that has balance for contract curio_erc1155_contract_addr,
    // have them send tokens manually to localAccount1's address
    await ethers.provider.send('hardhat_impersonateAccount', [acct_w_existing_curio_balance]);
    const mainnetAccount = await ethers.provider.getSigner(acct_w_existing_curio_balance);

    const curioContract_mainnetAccount = await new ethers.Contract(curio_erc1155_contract_addr, curio_erc1155_abi, mainnetAccount);
    await curioContract_mainnetAccount.safeBatchTransferFrom(
      acct_w_existing_curio_balance,
      localAccount1.getAddress(),
      [1, 2],
      [3, 5],
      "0x"
     );

    const curioContract_localAccount1 = await new ethers.Contract(curio_erc1155_contract_addr, curio_erc1155_abi, localAccount1);

    // After sending tokens to local address,
    // local address should give approval to disperse contract
    await curioContract_localAccount1.setApprovalForAll(disperse.address, true);

    // disperse from localAccount1 to localAccount2
    await expect(disperse
    .disperse(
        curio_erc1155_contract_addr,
        [localAccount2.getAddress()],
        [1, 2],
        [3, 6], // insufficient balance!
        "0x"
      )
    ).to.be.revertedWith("Insufficient balance");
  });

  it("Should succeed when the owner gives approval and owns the NFT (1 recipient)", async function () {
    const Disperse = await ethers.getContractFactory("DisperseNft");
    const disperse = await Disperse.deploy();
    await disperse.deployed();

    const [localAccount1, localAccount2] = await ethers.getSigners();

    // Impersonate account that has balance for contract curio_erc1155_contract_addr,
    // have them send tokens manually to localAccount1's address
    await ethers.provider.send('hardhat_impersonateAccount', [acct_w_existing_curio_balance]);
    const mainnetAccount = await ethers.provider.getSigner(acct_w_existing_curio_balance);

    const curioContract_mainnetAccount = await new ethers.Contract(curio_erc1155_contract_addr, curio_erc1155_abi, mainnetAccount);
    await curioContract_mainnetAccount.safeBatchTransferFrom(
      acct_w_existing_curio_balance,
      localAccount1.getAddress(),
      [1, 2],
      [3, 6],
      "0x"
     );

    const curioContract_localAccount1 = await new ethers.Contract(curio_erc1155_contract_addr, curio_erc1155_abi, localAccount1);

    // After sending tokens to local address,
    // local address should give approval to disperse contract
    await curioContract_localAccount1.setApprovalForAll(disperse.address, true);

    // disperse from localAccount1 to localAccount2
    const disperseTx = await disperse
      .connect(localAccount1)
      .disperse(
        curio_erc1155_contract_addr,
        [localAccount2.getAddress()],
        [1, 2],
        [3, 6],
        "0x"
      );

    await disperseTx.wait();

    // check balance of localAccount1 and localAccount2
    const balanceRes1 = await curioContract_localAccount1.balanceOfBatch([localAccount1.getAddress(), localAccount1.getAddress()], [1, 2]);
    expect(balanceRes1[0]).to.equal(0);
    expect(balanceRes1[1]).to.equal(0);

    const balanceRes2 = await curioContract_localAccount1.balanceOfBatch([localAccount2.getAddress(), localAccount2.getAddress()], [1, 2]);
    expect(balanceRes2[0]).to.equal(3);
    expect(balanceRes2[1]).to.equal(6);
  });

  it("Should succeed when the owner gives approval and owns the NFT (2 recipients)", async function () {
    const Disperse = await ethers.getContractFactory("DisperseNft");
    const disperse = await Disperse.deploy();
    await disperse.deployed();

    const [localAccount1, localAccount2, localAccount3] = await ethers.getSigners();

    // Impersonate account that has balance for contract curio_erc1155_contract_addr,
    // have them send tokens manually to localAccount1's address
    await ethers.provider.send('hardhat_impersonateAccount', [acct_w_existing_curio_balance]);
    const mainnetAccount = await ethers.provider.getSigner(acct_w_existing_curio_balance);

    const curioContract_mainnetAccount = await new ethers.Contract(curio_erc1155_contract_addr, curio_erc1155_abi, mainnetAccount);
    await curioContract_mainnetAccount.safeBatchTransferFrom(
      acct_w_existing_curio_balance,
      localAccount1.getAddress(),
      [1, 2],
      [4, 6],
      "0x"
     );

    const curioContract_localAccount1 = await new ethers.Contract(curio_erc1155_contract_addr, curio_erc1155_abi, localAccount1);

    // After sending tokens to local address,
    // local address should give approval to disperse contract
    await curioContract_localAccount1.setApprovalForAll(disperse.address, true);

    // disperse from localAccount1 to [localAccount2, localAccount3]
    const disperseTx = await disperse
      .connect(localAccount1)
      .disperse(
        curio_erc1155_contract_addr,
        [localAccount2.getAddress(), localAccount3.getAddress()],
        [1, 2],
        [2, 3],
        "0x"
      );

    await disperseTx.wait();

    // check balance of localAccount1 and localAccount2
    const balanceRes1 = await curioContract_localAccount1.balanceOfBatch([localAccount1.getAddress(), localAccount1.getAddress()], [1, 2]);
    expect(balanceRes1[0]).to.equal(0);
    expect(balanceRes1[1]).to.equal(0);

    const balanceRes2 = await curioContract_localAccount1.balanceOfBatch([localAccount2.getAddress(), localAccount2.getAddress()], [1, 2]);
    expect(balanceRes2[0]).to.equal(2);
    expect(balanceRes2[1]).to.equal(3);

    const balanceRes3 = await curioContract_localAccount1.balanceOfBatch([localAccount2.getAddress(), localAccount2.getAddress()], [1, 2]);
    expect(balanceRes3[0]).to.equal(2);
    expect(balanceRes3[1]).to.equal(3);
  });

});
