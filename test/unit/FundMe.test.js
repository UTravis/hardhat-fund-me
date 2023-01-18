const { deployments, ethers, getNamedAccounts, network } = require("hardhat");
const { assert, expect } = require("chai");
const { developmentChains } = require("../../helper-hardhat-config");

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("FundMe", async () => {
      let fundMe;
      let deployer;
      let mockV3Aggregator;
      const sendValue = ethers.utils.parseEther("1"); // 1 ETH to 1e18 (wei)

      beforeEach(async () => {
        // deploying using hardhat deploy
        deployer = (await getNamedAccounts()).deployer;
        await deployments.fixture(["all"]);
        mockV3Aggregator = await ethers.getContract(
          "MockV3Aggregator",
          deployer
        );
        fundMe = await ethers.getContract("FundMe", deployer);
      });

      describe("constructor", async () => {
        it("sets the Aggregator address correctly", async () => {
          const response = await fundMe.getPriceFeed();
          assert.equal(response, mockV3Aggregator.address);
        });
      });

      describe("fund", async () => {
        it("Fails if you don't send enough ETH", async () => {
          await expect(fundMe.fund()).to.be.revertedWith(
            "You need to spend more ETH!"
          );
        });
        it("updated the amount funded data structure", async () => {
          await fundMe.fund({ value: sendValue });
          const response = await fundMe.getAddressToAmountFunded(deployer);
          assert.equal(response, sendValue.toString());
        });
        it("Adds funder to array of funders", async () => {
          await fundMe.fund({ value: sendValue });
          const funder = await fundMe.getFunder(0);
          assert.equal(funder, deployer);
        });
      });

      describe("withdraw", async () => {
        // Fund contract
        beforeEach(async () => {
          await fundMe.fund({ value: sendValue });
        });

        it("withdraw ETH from a single funder", async () => {
          // Arrange
          const startingFundMeBalance = await ethers.provider.getBalance(
            fundMe.address
          );
          const startingDeployerBalance = await ethers.provider.getBalance(
            deployer
          );

          //Act
          const txResponse = await fundMe.withdraw();
          const txReceipt = await txResponse.wait(1);

          const { gasUsed, effectiveGasPrice } = txReceipt;
          const gasCost = gasUsed.mul(effectiveGasPrice);

          const newFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          );
          const newDeployerBalance = await fundMe.provider.getBalance(deployer);

          //Assert
          assert.equal(newFundMeBalance, 0);
          // startingFundMeBalance + startingDeployerBalance = newDeployerBalance
          assert.equal(
            startingFundMeBalance.add(startingDeployerBalance).toString(),
            newDeployerBalance.add(gasCost).toString()
          );
        });
        it("testing cheaper withdrawal.......", async () => {
          // Arrange
          const startingFundMeBalance = await ethers.provider.getBalance(
            fundMe.address
          );
          const startingDeployerBalance = await ethers.provider.getBalance(
            deployer
          );

          //Act
          const txResponse = await fundMe.cheaperWithdraw();
          const txReceipt = await txResponse.wait(1);

          const { gasUsed, effectiveGasPrice } = txReceipt;
          const gasCost = gasUsed.mul(effectiveGasPrice);

          const newFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          );
          const newDeployerBalance = await fundMe.provider.getBalance(deployer);

          //Assert
          assert.equal(newFundMeBalance, 0);
          // startingFundMeBalance + startingDeployerBalance = newDeployerBalance
          assert.equal(
            startingFundMeBalance.add(startingDeployerBalance).toString(),
            newDeployerBalance.add(gasCost).toString()
          );
        });
        it("it allows withdrawal with multiple funders", async () => {
          const accounts = await ethers.getSigners();
          // starting with index 1 because account with index 0 is the deployer
          for (let i = 1; i < 6; i++) {
            const fundMeConnectedContract = await fundMe.connect(accounts[i]);
            await fundMeConnectedContract.fund({ value: sendValue });
          }

          const startingFundMeBalance = await ethers.provider.getBalance(
            fundMe.address
          );
          const startingDeployerBalance = await ethers.provider.getBalance(
            deployer
          );

          const txResponse = await fundMe.withdraw();
          const txReciept = await txResponse.wait(1);

          const { gasUsed, effectiveGasPrice } = txReciept;
          const gasCost = gasUsed.mul(effectiveGasPrice);

          const newFundMeBalance = await ethers.provider.getBalance(
            fundMe.address
          );
          const newDeployerBalance = await ethers.provider.getBalance(deployer);

          //Assert
          assert.equal(newFundMeBalance, 0);
          // startingFundMeBalance + startingDeployerBalance = newDeployerBalance
          assert.equal(
            startingFundMeBalance.add(startingDeployerBalance).toString(),
            newDeployerBalance.add(gasCost).toString()
          );

          //Resetting the funders array
          await expect(fundMe.getFunder(0)).to.be.reverted;

          for (let i = 0; i < 6; i++) {
            assert.equal(
              await fundMe.getAddressToAmountFunded(accounts[i].address),
              0
            );
          }
        });
        it("only allows the owner to withdraw", async () => {
          const accounts = await ethers.getSigners();
          const attacker = accounts[1];
          const attackerConnectedContract = await fundMe.connect(attacker);

          await expect(
            attackerConnectedContract.withdraw()
          ).to.be.revertedWithCustomError(fundMe, "FundMe__NotOwner");
        });
      });
    });
