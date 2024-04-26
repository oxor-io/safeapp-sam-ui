/* global BigInt */

import {
  validatePrivKey,
  validateMsgHash,
  bigintToArrayBitwise,
  Uint8ArrayToBigintBitwise,
} from "./common";
import { addHexPrefix, isHexString, toBuffer, privateToPublic, ecsign } from "ethereumjs-util";

// k registers of n bits each
const N = 64n;
const K = 4n;
const ONE_WORD = 256n;

/**
 * @param {String} msgHash - msg to be signed as hex
 * @param {Uint8Array} privKey - Private key to sign the message
 * @returns {Object} { rAsChunks, sAsChunks, msgHashAsChunks, pubKeyXAsChunks, pubKeyYAsChunks } - witness
 */
export async function signMessageChunks(msgHash, privKey, params = { N, K }) {
  const { N, K } = params;

  if (N * K !== ONE_WORD) {
    throw new Error("N * K must be 256 (32 bytes)");
  }

  const {
    signature: { r, s },
    pubKey,
    msgHashU8,
  } = await _signMessage(msgHash, privKey);

  const rAsChunks = bigintToArrayBitwise(N, K, BigInt(addHexPrefix(r.toString("hex"))));
  const sAsChunks = bigintToArrayBitwise(N, K, BigInt(addHexPrefix(s.toString("hex"))));

  const msgHashAsChunks = bigintToArrayBitwise(N, K, Uint8ArrayToBigintBitwise(msgHashU8));

  const pubKeyXAsChunks = bigintToArrayBitwise(N, K, pubKey.x);
  const pubKeyYAsChunks = bigintToArrayBitwise(N, K, pubKey.y);

  return {
    rAsChunks,
    sAsChunks,
    msgHashAsChunks,
    pubKeyXAsChunks,
    pubKeyYAsChunks,
  };
}

async function _signMessage(msgHash, privKey) {
  validateMsgHash(msgHash);
  validatePrivKey(privKey);

  // After this block msgHash is Uint8Array
  if (isHexString(msgHash) || isHexString(addHexPrefix(msgHash))) {
    msgHash = toBuffer(addHexPrefix(msgHash));
  }

  const privKeyBuffer = toBuffer(privKey);
  const signature = ecsign(msgHash, privKeyBuffer);

  let pubKey = privateToPublic(privKeyBuffer);
  const pubKeyStr = pubKey.toString("hex");

  pubKey = {
    x: BigInt(addHexPrefix(pubKeyStr.slice(0, 64))),
    y: BigInt(addHexPrefix(pubKeyStr.slice(64))),
  };

  return { signature, pubKey, msgHashU8: msgHash };
}
