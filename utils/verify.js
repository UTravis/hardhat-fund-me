const { run } = require("hardhat")

const verify = async (contractAddress, args) => {
    console.log("verifying contract on etherscan.................")
    try {
        await run("verify:verify", {
            address: contractAddress,
            constructorArguments: args
        })
    } catch (error) {
        if(error.message.toLowerCase().includes('already verified')){
            console.log("Contract already verified")
        }else{
            console.log(error)
        }
    }

}

module.exports = {verify}
