import { HardhatRuntimeEnvironment } from "hardhat/types"
import { DeployFunction } from "hardhat-deploy/types"
import { ethers } from "hardhat"

const setupGovContracts: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { getNamedAccounts, deployments, network } = hre
  const { deploy, log } = deployments
  const { deployer } = await getNamedAccounts()
  const chainId = network.config.chainId
  const ADDRESS_ZERO = ethers.constants.AddressZero

  const timeLock = await ethers.getContract("TimeLock", deployer)
  const govContract = await ethers.getContract("GovernorContract", deployer)

  log("setting roles ...")

  // get roles
  const proposerRole = await timeLock.PROPOSER_ROLE()
  const executorRole = await timeLock.EXECUTOR_ROLE()
  const adminRole = await timeLock.TIMELOCK_ADMIN_ROLE()

  // make governor the only proposer
  const proposerTx = await timeLock.grantRole(proposerRole, govContract.address)
  await proposerTx.wait(1)

  // have anyone be able to execute
  const executorTx = await timeLock.grantRole(executorRole, ADDRESS_ZERO)
  await executorTx.wait(1)

  // take away our admin permissions
  const revokeAdminTx = await timeLock.revokeRole(adminRole, deployer)
  await revokeAdminTx.wait(1)

  log("roles set successfully!")
}

export default setupGovContracts

setupGovContracts.tags = ["all", "setup"]
