const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DisperseNft", function () {
  it("Should fail to disperse without an approval", async function () {
    const Disperse = await ethers.getContractFactory("DisperseNft");
    const disperse = await Disperse.deploy();
    await disperse.deployed();

    const params = {
      contract: "0x73DA73EF3a6982109c4d5BDb0dB9dd3E3783f313",
      recipients: ["0x70997970C51812dc3A010C7d01b50e0d17dc79C8"],
      ids: ["0"],
      quantities: ["1"],
    };

    await expect(
      disperse.disperse(
        params.contract,
        params.recipients,
        params.ids,
        params.quantities,
        "0x"
      )
    ).to.be.revertedWith("Need operator approval for 3rd party transfers.");
  });

  it("Should successfully disperse with approval", async function () {
    const Disperse = await ethers.getContractFactory("DisperseNft");
    const disperse = await Disperse.deploy();
    await disperse.deployed();

    const params = {
      contract: "0x73DA73EF3a6982109c4d5BDb0dB9dd3E3783f313",
      recipients: ["0x70997970C51812dc3A010C7d01b50e0d17dc79C8"],
      ids: ["0"],
      quantities: ["1"],
    };

    console.log(`Ready to commit transaction. Parameters:
      contract: \t${JSON.stringify(params.contract)},
      recipients: \t${JSON.stringify(params.recipients)},
      token ids: \t${JSON.stringify(params.ids)},
      quantities: \t${JSON.stringify(params.quantities)},
      binary data: \t"0x"
    `);

    const disperseTx = await disperse.disperse(
      params.contract,
      params.recipients,
      params.ids,
      params.quantities,
      "0x"
    );

    await disperseTx.wait();
  });


});
