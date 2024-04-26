import { getInclusionProof } from "./merkleTree.js";
import { signMessageChunks } from "./signMessage.js";

import { privKeyToStringAddress } from "./common/index.js";

export async function generateDataCircom(privKey, participantAddresses, msgHash, treeHeight) {
  const { rAsChunks, sAsChunks, msgHashAsChunks, pubKeyXAsChunks, pubKeyYAsChunks } = await signMessageChunks(
    msgHash,
    privKey,
  );

  const currentAddress = privKeyToStringAddress(privKey);
  const { proof, tree } = await getInclusionProof(currentAddress, participantAddresses, treeHeight);

  const witness = {
    root: tree.root.toString(),

    pathElements: proof.pathElements,
    pathIndices: proof.pathIndices,

    msgHash: msgHashAsChunks,
    pubKey: [pubKeyXAsChunks, pubKeyYAsChunks],
    r: rAsChunks,
    s: sAsChunks,
  };

  return witness;
}
