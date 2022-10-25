import { network } from "hardhat"

const moveTime = async (amount: number) => {
    console.log('Moving blocks ...')
    await network.provider.send("evm_increaseTime", [amount])
    console.log(`Moved forward time by ${amount} seconds`)
}

export default moveTime