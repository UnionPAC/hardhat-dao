import { HardhatRuntimeEnvironment } from "hardhat/types"
import { DeployFunction } from "hardhat-deploy/types"
import verify from "../helper-functions"
import { ethers } from "hardhat"

const deployBox: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  // @ts-ignore
  const { getNamedAccounts, deployments, network } = hre
  const { deploy, log } = deployments
  const { deployer } = await getNamedAccounts()
  const chainId = network.config.chainId

  log("--------------------------------")
  log("Deploying Box and waiting for confirmations....")

  const box = await deploy("Box", {
    from: deployer,
    log: true,
    args: [],
    autoMine: true,
  })

  log(`Box address: ${box.address}`)

  const timeLock = await ethers.getContract("TimeLock")
  const boxContract = await ethers.getContract("Box")

  log("Transferring ownership ...")

  const transferOwnerTx = await boxContract.transferOwnership(timeLock.address)

  await transferOwnerTx.wait(1)
  log(" Transfer owner success! ")

  // verify
  if (chainId != 31337 && process.env.ETHERSCAN_API_KEY) {
    log("Verifying ...")
    await verify(box.address, [])
  }
}

export default deployBox

deployBox.tags = ["all", "box"]
