import {
  Initialized as InitializedEvent,
  UserInitialized as UserInitializedEvent,
  UserUpdated as UserUpdatedEvent,
  UserXLinked as UserXLinkedEvent
} from "../generated/QuantumOrb7FadC1/QuantumOrb7FadC1"
import {
  Initialized,
  UserInitialized,
  UserUpdated,
  UserXLinked,
  User
} from "../generated/schema"

export function handleInitialized(event: InitializedEvent): void {
  let entity = new Initialized(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.version = event.params.version

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleUserInitialized(event: UserInitializedEvent): void {
  let entity = new UserInitialized(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.user = event.params.user
  entity.parent = event.params.parent

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleUserUpdated(event: UserUpdatedEvent): void {
  let entity = new UserUpdated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.user = event.params.user
  entity.points = event.params.points
  entity.referralPoints = event.params.referralPoints

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  let user = User.load(event.params.user.toHex())

  if (user == null) {
    user = new User(event.params.user.toHex())
  }

  user.points = event.params.points

  user.save()
  entity.save()
}

export function handleUserXLinked(event: UserXLinkedEvent): void {
  let entity = new UserXLinked(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.user = event.params.user
  entity.x_link = event.params.x_link

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
