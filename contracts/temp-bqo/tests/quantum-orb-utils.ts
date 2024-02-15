import { newMockEvent } from "matchstick-as"
import { ethereum, Address, BigInt } from "@graphprotocol/graph-ts"
import { MarkedAsPartner, OrbOpened } from "../generated/QuantumOrb/QuantumOrb"

export function createMarkedAsPartnerEvent(user: Address): MarkedAsPartner {
  let markedAsPartnerEvent = changetype<MarkedAsPartner>(newMockEvent())

  markedAsPartnerEvent.parameters = new Array()

  markedAsPartnerEvent.parameters.push(
    new ethereum.EventParam("user", ethereum.Value.fromAddress(user))
  )

  return markedAsPartnerEvent
}

export function createOrbOpenedEvent(
  user: Address,
  pointsEarned: BigInt
): OrbOpened {
  let orbOpenedEvent = changetype<OrbOpened>(newMockEvent())

  orbOpenedEvent.parameters = new Array()

  orbOpenedEvent.parameters.push(
    new ethereum.EventParam("user", ethereum.Value.fromAddress(user))
  )
  orbOpenedEvent.parameters.push(
    new ethereum.EventParam(
      "pointsEarned",
      ethereum.Value.fromUnsignedBigInt(pointsEarned)
    )
  )

  return orbOpenedEvent
}
