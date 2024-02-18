import { newMockEvent } from "matchstick-as"
import { ethereum, BigInt, Address } from "@graphprotocol/graph-ts"
import {
  Initialized,
  OrbOpened,
  UserInitialized,
  UserUpdated,
  UserXLinked
} from "../generated/QuantumOrb/QuantumOrb"

export function createInitializedEvent(version: BigInt): Initialized {
  let initializedEvent = changetype<Initialized>(newMockEvent())

  initializedEvent.parameters = new Array()

  initializedEvent.parameters.push(
    new ethereum.EventParam(
      "version",
      ethereum.Value.fromUnsignedBigInt(version)
    )
  )

  return initializedEvent
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

export function createUserInitializedEvent(
  user: Address,
  parent: Address
): UserInitialized {
  let userInitializedEvent = changetype<UserInitialized>(newMockEvent())

  userInitializedEvent.parameters = new Array()

  userInitializedEvent.parameters.push(
    new ethereum.EventParam("user", ethereum.Value.fromAddress(user))
  )
  userInitializedEvent.parameters.push(
    new ethereum.EventParam("parent", ethereum.Value.fromAddress(parent))
  )

  return userInitializedEvent
}

export function createUserUpdatedEvent(
  user: Address,
  points: BigInt,
  referralPoints: BigInt
): UserUpdated {
  let userUpdatedEvent = changetype<UserUpdated>(newMockEvent())

  userUpdatedEvent.parameters = new Array()

  userUpdatedEvent.parameters.push(
    new ethereum.EventParam("user", ethereum.Value.fromAddress(user))
  )
  userUpdatedEvent.parameters.push(
    new ethereum.EventParam("points", ethereum.Value.fromUnsignedBigInt(points))
  )
  userUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "referralPoints",
      ethereum.Value.fromUnsignedBigInt(referralPoints)
    )
  )

  return userUpdatedEvent
}

export function createUserXLinkedEvent(
  user: Address,
  x_link: string
): UserXLinked {
  let userXLinkedEvent = changetype<UserXLinked>(newMockEvent())

  userXLinkedEvent.parameters = new Array()

  userXLinkedEvent.parameters.push(
    new ethereum.EventParam("user", ethereum.Value.fromAddress(user))
  )
  userXLinkedEvent.parameters.push(
    new ethereum.EventParam("x_link", ethereum.Value.fromString(x_link))
  )

  return userXLinkedEvent
}
