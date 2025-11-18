import {SessionKey} from "@mysten/seal";
import {Transaction} from "@mysten/sui/transactions";
import {fromHex} from "@mysten/sui/utils";


export default async function decrypt(keypair, suiClient, sealClient, dataId, encryptedBytes) {
  const sessionKey = await SessionKey.create({
    address: keypair.getPublicKey().toSuiAddress(),
    packageId: process.env.PACKAGE,
    ttlMin: 10,
    suiClient: suiClient,
  });

  const message = sessionKey.getPersonalMessage();
  const {signature} = await keypair.signPersonalMessage(message);
  sessionKey.setPersonalMessageSignature(signature);

  const tx = new Transaction();

  tx.moveCall({
    target: `${process.env.PACKAGE}::policy::seal_approve`,
    arguments: [
      tx.pure.vector("u8", Array.from(fromHex(dataId))),
      tx.object(process.env.NFT_OBJECT_ID),
    ],
  });

  await suiClient.signAndExecuteTransaction({
    signer: keypair,
    transaction: tx,
  });
  const txBytes = await tx.build({
    client: suiClient,
    onlyTransactionKind: true,
  });
  const decryptedBytes = await sealClient.decrypt({
    data: encryptedBytes,
    sessionKey,
    txBytes,
  });

  return decryptedBytes;
}
