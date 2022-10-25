import { ethers, network } from "hardhat"
import {
  NEW_STORE_VALUE,
  FUNC,
  PROPOSAL_DESCRIPTION,
  devChains,
  VOTING_DELAY,
} from "../helper-hardhat-config"
import moveBlocks from "../utils/move-blocks"
import { proposalsFile } from "../helper-hardhat-config"
import * as fs from "fs"

const propose = async (args: any[], functionToCall: string, proposalDescription: string) => {
  const governor = await ethers.getContract("GovernorContract")
  const box = await ethers.getContract("Box")

  const encodedFunctionCall = box.interface.encodeFunctionData(functionToCall, args)
  console.log(encodedFunctionCall)

  console.log(`Proposing ${functionToCall} on ${box.address} with ${args}`)
  console.log(`Proposal Description: \n ${proposalDescription}`)

  // address[] memory targets, uint256[] memory values, bytes[] memory calldatas, string memory description
  const proposeTx = await governor.propose(
    [box.address],
    [0],
    [encodedFunctionCall],
    proposalDescription
  )

  // since we have a voting delay, we need to move time manually!
  if (devChains.includes(network.name)) {
    await moveBlocks(VOTING_DELAY + 1) // we need to wait more than the voting delay period
  }

  const proposeTxReceipt = await proposeTx.wait(1)
  const proposalId = proposeTxReceipt.events[0].args.proposalId

  console.log(`Proposed with proposal ID: ${proposalId}`)

  // get proposal state, snapshot and deadline
  const proposalState = await governor.state(proposalId)
  const proposalSnapshot = await governor.proposalSnapshot(proposalId)
  const proposalDeadline = await governor.proposalDeadline(proposalId)

  // save the proposalId
  storeProposalId(proposalId)

  console.log(`Current proposal state: ${proposalState}`)
  console.log(`Current proposal snapshot: ${proposalSnapshot}`)
  console.log(`Current proposal deadline: ${proposalDeadline}`)
}

const storeProposalId = (proposalId: any) => {
  // create proposal file w/ proposals data
  const chainId = network.config.chainId!.toString()
  let proposals: any

  // create proposal object w/ chainId's
  if (fs.existsSync(proposalsFile)) {
    proposals = JSON.parse(fs.readFileSync(proposalsFile, "utf8"))
  } else {
    proposals = {}
    proposals[chainId] = []
  }

  // push proposalId to proposal object
  proposals[chainId].push(proposalId.toString())
  fs.writeFileSync(proposalsFile, JSON.stringify(proposals), "utf8")
}

propose([NEW_STORE_VALUE], FUNC, PROPOSAL_DESCRIPTION)
  .then(() => process.exit(0))
  .catch((error) => {
    console.log(error)
    process.exit(1)
  })
