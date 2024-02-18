import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { Address, BigInt } from "@graphprotocol/graph-ts"
import { OrbOpened } from "../generated/schema"
import { OrbOpened as OrbOpenedEvent } from "../generated/QuantumOrb9E2E76/QuantumOrb9E2E76"
import { handleOrbOpened } from "../src/quantum-orb-9-e-2-e-76"
import { createOrbOpenedEvent } from "./quantum-orb-9-e-2-e-76-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let user = Address.fromString("0x0000000000000000000000000000000000000001")
    let pointsEarned = BigInt.fromI32(234)
    let newOrbOpenedEvent = createOrbOpenedEvent(user, pointsEarned)
    handleOrbOpened(newOrbOpenedEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

  test("OrbOpened created and stored", () => {
    assert.entityCount("OrbOpened", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "OrbOpened",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "user",
      "0x0000000000000000000000000000000000000001"
    )
    assert.fieldEquals(
      "OrbOpened",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "pointsEarned",
      "234"
    )

    // More assert options:
    // https://thegraph.com/docs/en/developer/matchstick/#asserts
  })
})
