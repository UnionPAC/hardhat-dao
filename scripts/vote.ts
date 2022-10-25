import { ethers, network } from "hardhat"
import * as fs from "fs"
import { devChains, proposalsFile, VOTING_PERIOD } from "../helper-hardhat-config"
import moveBlocks from "../utils/move-blocks"

const main = async () => {
  const proposals = JSON.parse(fs.readFileSync(proposalsFile, "utf8"))
  const latestProposalId = proposals[network.config.chainId!].at(-1)
  // 0 = Against, 1 = For, 2 = Abstain for this example
  const voteWay = 1
  const reason = "because i like that number"
  await vote(latestProposalId, voteWay, reason)
}

const vote = async (proposalId: string, voteWay: number, reason: string) => {
  console.log("Voting ...")
  const governor = await ethers.getContract("GovernorContract")
  // we are going to use the castVoteWithReason to cast our vote
  // @dev See {IGovernor-castVoteWithReason}

  /* params
    uint256 proposalId,
    uint8 support,
    string calldata reason
    */
  const voteTx = await governor.castVoteWithReason(proposalId, voteWay, reason)
  const voteTxReceipt = await voteTx.wait(1)
  let proposalState = await governor.state(proposalId)
  console.log(`Current proposal state: ${proposalState}`)

  if (devChains.includes(network.name)) {
    await moveBlocks(VOTING_PERIOD + 1)
  }

   proposalState = await governor.state(proposalId)
  console.log(`Current proposal state: ${proposalState}`)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
