import { User } from "../generated/schema";
import { BigInt } from "@graphprotocol/graph-ts";

function ensureUser(userAddress: string): User {
  let user = User.load(userAddress);
  if (!user) {
    user = new User(userAddress);
    user.partner = false;
    user.pointsEarned = BigInt.fromI32(0);
  }
  return user as User;
}
