import {
  isValidPrivate,
  isValidPublic,
  toBuffer,
  toChecksumAddress,
  isValidChecksumAddress,
  addHexPrefix,
  privateToAddress,
} from "ethereumjs-util"

import { Buffer } from 'buffer'

// export function validatePubKey(pubKey) {
//   if (!Buffer.isBuffer(pubKey)) pubKey = toBuffer(pubKey);
//   assert(isValidPublic(pubKey), "Invalid public key");
// }

export function validatePrivKey(privKey) {
  if (!Buffer.isBuffer(privKey)) privKey = toBuffer(privKey);
  if (!isValidPrivate(privKey)) {
    throw new Error("Invalid private key");
  }
}

export function privKeyToStringAddress(privKey) {
  if (!(privKey instanceof Uint8Array)) {
    throw new Error("Private key must be Uint8Array");
  }

  return addHexPrefix(privateToAddress(toBuffer(privKey)).toString("hex"));
}

export function toChecksumAddressIfNot(address) {
  if (!isValidChecksumAddress(address)) {
    address = toChecksumAddress(address);
  }

  return address;
}
