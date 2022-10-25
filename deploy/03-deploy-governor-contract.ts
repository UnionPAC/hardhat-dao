import { HardhatRuntimeEnvironment } from "hardhat/types"
import { DeployFunction } from "hardhat-deploy/types"
import verify from "../helper-functions"
import { VOTING_DELAY, VOTING_PERIOD, QUORUM_PERCENTAGE } from "../helper-hardhat-config"
import { ethers } from "hardhat"

const deployGovContract: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { getNamedAccounts, deployments, network } = hre
  const { deploy, log } = deployments
  const { deployer } = await getNamedAccounts()
  const chainId = network.config.chainId

  const govToken = await ethers.getContract("GovToken")
  const timeLock = await ethers.getContract("TimeLock")

  log("--------------------------------")
  log("Deploying governor contract and waiting for confirmations....")

  /*
    IVotes _token,
    TimelockController _timelock,
    uint256 _votingDelay,
    uint256 _votingPeriod,
    uint256 _quorumPercentage
  */

  const govContract = await deploy("GovernorContract", {
    from: deployer,
    log: true,
    args: [govToken.address, timeLock.address, VOTING_DELAY, VOTING_PERIOD, QUORUM_PERCENTAGE],
    autoMine: true,
  })

  log(`GovContract address: ${govContract.address}`)

  // verify
  if (chainId != 31337 && process.env.ETHERSCAN_API_KEY) {
    log("Verifying ...")
    await verify(govContract.address, [])
  }
}

export default deployGovContract

deployGovContract.tags = ["all", "governor"]
