import {
  MarkedAsPartner as MarkedAsPartnerEvent,
  OrbOpened as OrbOpenedEvent
} from "../generated/QuantumOrb/QuantumOrb"
import { MarkedAsPartner, OrbOpened } from "../generated/schema"

export function handleMarkedAsPartner(event: MarkedAsPartnerEvent): void {
  let entity = new MarkedAsPartner(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.user = event.params.user

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleOrbOpened(event: OrbOpenedEvent): void {
  let entity = new OrbOpened(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.user = event.params.user
  entity.pointsEarned = event.params.pointsEarned

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
