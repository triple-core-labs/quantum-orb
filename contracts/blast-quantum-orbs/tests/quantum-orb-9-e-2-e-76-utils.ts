import { newMockEvent } from "matchstick-as"
import { ethereum, Address, BigInt } from "@graphprotocol/graph-ts"
import { OrbOpened } from "../generated/QuantumOrb9E2E76/QuantumOrb9E2E76"

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
