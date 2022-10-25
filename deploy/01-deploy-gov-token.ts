import { HardhatRuntimeEnvironment } from "hardhat/types"
import { DeployFunction } from "hardhat-deploy/types"
import verify from "../helper-functions"
import { ethers } from "hardhat"

const deployGovToken: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  // @ts-ignore
  const { getNamedAccounts, deployments, network } = hre
  const { deploy, log } = deployments
  const { deployer } = await getNamedAccounts()
  const chainId = network.config.chainId

  log("--------------------------------")
  log("Deploying governance token and waiting for confirmations....")

  const govToken = await deploy("GovToken", {
    from: deployer,
    log: true,
    args: [],
    autoMine: true,
  })

  log(`GovToken address: ${govToken.address}`)

  // verify
  if (chainId != 31337 && process.env.ETHERSCAN_API_KEY) {
    log("Verifying ...")
    await verify(govToken.address, [])
  }

  // delegate
  log(`Delegating to ${deployer}`)
  await delegate(govToken.address, deployer)
  log("Delegated successfully!")
}

const delegate = async (govTokenAddress: string, delegatedAccount: string) => {
  const govToken = await ethers.getContractAt("GovToken", govTokenAddress)
  const tx = await govToken.delegate(delegatedAccount)
  await tx.wait(1)
  console.log(`Checkpoints: ${await govToken.numCheckpoints(delegatedAccount)}`)
}

export default deployGovToken

deployGovToken.tags = ["all", "govtoken"]
