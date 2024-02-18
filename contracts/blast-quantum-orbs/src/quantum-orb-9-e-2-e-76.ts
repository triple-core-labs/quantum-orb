import { OrbOpened as OrbOpenedEvent } from "../generated/QuantumOrb9E2E76/QuantumOrb9E2E76"
import { OrbOpened } from "../generated/schema"

export function handleOrbOpened(event: OrbOpenedEvent): void {
  let entity = new OrbOpened(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.user = event.params.user
  entity.pointsEarned = event.params.pointsEarned

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
