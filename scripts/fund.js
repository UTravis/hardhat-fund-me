// A QUICK SCRIPT TO DEPLOY AND FUND CONTRACT

const { getNamedAccounts, network, ethers } = require("hardhat");

async function main() {

    const { deployer } = await getNamedAccounts();
    const fundMe = await ethers.getContract("FundMe", deployer);

    console.log("Funding Contract.......")

    const txResponse = await fundMe.fund({value: ethers.utils.parseEther("0.1")})
    await txResponse.wait(1)

    console.log("Funded!!!")

}

main().then(() => {
    process.exit(0)
}).catch(error => {
    console.error(error);
    process.exit(1)
})