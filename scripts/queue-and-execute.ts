import { ethers, network } from "hardhat"
import {
  devChains,
  FUNC,
  MIN_DELAY,
  NEW_STORE_VALUE,
  PROPOSAL_DESCRIPTION,
} from "../helper-hardhat-config"
import moveBlocks from "../utils/move-blocks"
import moveTime from "../utils/move-time"

const queueAndExecute = async () => {
  const args = [NEW_STORE_VALUE]
  const box = await ethers.getContract("Box")
  const encodedFunctionCall = box.interface.encodeFunctionData(FUNC, args)
  console.log(`Encoded Function Call: ${encodedFunctionCall} `)
  const descriptionHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(PROPOSAL_DESCRIPTION))

  const governor = await ethers.getContract("GovernorContract")
  /* params
    address[] memory targets,
    uint256[] memory values,
    bytes[] memory calldatas,
    bytes32 descriptionHash
    */
  console.log(`Queueing ... `)
  const queueTx = await governor.queue([box.address], [0], [encodedFunctionCall], descriptionHash)
  const queueTxReceipt = await queueTx.wait(1)

  if (devChains.includes(network.name)) {
    await moveTime(MIN_DELAY + 1)
    await moveBlocks(1)
  }

  console.log("Executing ...")
  const execute = await governor.execute([box.address], [0], [encodedFunctionCall], descriptionHash)
  const executeReceipt = await execute.wait(1)
  
  const boxNewValue = await box.retrieve()
  console.log(`The box value after the propsal is ${boxNewValue}`)
}

queueAndExecute()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
