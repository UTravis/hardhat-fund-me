// function deployFunc() {
//     console.log("Hi");
// }

// module.exports.default = deployFunc

const { network } = require("hardhat");
const { networkConfig, developmentChains } = require("../helper-hardhat-config.js");
const { verify } = require("../utils/verify.js");


module.exports = async (hre) => {
    const { getNamedAccounts, deployments } = hre

    const { deploy, log, get } = deployments;
    const { deployer } = await getNamedAccounts();
    const chainId = network.config.chainId

    let ethUsdPriceFeedAddress;

    // If a local network is detected
    if(developmentChains.includes(network.name)){
        // Gets the address of the last deployment
        const ethUsdAggregator = await get("MockV3Aggregator")
        ethUsdPriceFeedAddress = ethUsdAggregator.address
    }else{
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    }

    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: [ethUsdPriceFeedAddress], // Put priceFeedAddress address
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1
    })
    log("Deployed contract ('U') ")
    log("---------------------------------------")

    // Programmatically verifying code on etherscan
    if(!developmentChains.includes(network.name) &&  process.env.ETHERSCAN_API_KEY){
        //VERIFY
        await verify(fundMe.address, [ethUsdPriceFeedAddress])
    }

    
}

module.exports.tags = ["all", "fundme"]