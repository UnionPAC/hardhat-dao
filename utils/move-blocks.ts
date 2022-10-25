import { network } from "hardhat"

const moveBlocks = async (amount: number) => {
  console.log("Moving blocks ...")
  for (let i = 0; i < amount; i++) {
    await network.provider.request({
      method: "evm_mine",
      params: [],
    })
  }
  console.log(`Moved ${amount} blocks!`)
}

export default moveBlocks
