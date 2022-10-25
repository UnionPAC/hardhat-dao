import { HardhatRuntimeEnvironment } from "hardhat/types"
import { DeployFunction } from "hardhat-deploy/types"
import verify from "../helper-functions"
import { MIN_DELAY } from "../helper-hardhat-config"

const deployTimeLock: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  // @ts-ignore
  const { getNamedAccounts, deployments, network } = hre
  const { deploy, log } = deployments
  const { deployer } = await getNamedAccounts()
  const chainId = network.config.chainId

  log("--------------------------------")
  log("Deploying time lock and waiting for confirmations....")

  // args ...
  // uint256 minDelay
  // address[] memory proposers
  // address[] memory executors

  const timeLock = await deploy("TimeLock", {
    from: deployer,
    log: true,
    args: [MIN_DELAY, [], [] ],
    autoMine: true,
  })

  log(`TimeLock address: ${timeLock.address}`)

  // verify
  if (chainId != 31337 && process.env.ETHERSCAN_API_KEY) {
    log("Verifying ...")
    await verify(timeLock.address, [])
  }
}


export default deployTimeLock

deployTimeLock.tags = ["all", "timelock"]
