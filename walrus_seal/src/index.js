import {SuiClient, getFullnodeUrl} from "@mysten/sui/client";
import {SealClient, SessionKey} from "@mysten/seal";
import {Ed25519Keypair} from "@mysten/sui/keypairs/ed25519";
import {Transaction} from "@mysten/sui/transactions";
import {randomBytes} from "crypto";
import dotenv from "dotenv";
import {fromHex} from "@mysten/sui/utils";
dotenv.config();

const serverObjectIds = [
  "0x73d05d62c18d9374e3ea529e8e0ed6161da1a141a94d3f76ae3fe4e99356db75",
  "0xf5d14a81a982144ae441cd7d64b09027f116a468bd36e7eca494f750591623c8",
];
const keypair = Ed25519Keypair.fromSecretKey(process.env.PHRASE);
const suiClient = new SuiClient({url: getFullnodeUrl("testnet")});

async function main() {
  const sealClient = new SealClient({
    suiClient,
    serverConfigs: serverObjectIds.map((id) => ({
      objectId: id,
      weight: 1,
    })),
    verifyKeyServers: false,
  });

  const dataId = randomBytes(16).toString("hex");
  console.log("Data ID:", dataId);

  const {encryptedObject: encryptedBytes, key: backupKey} =
    await sealClient.encrypt({
      threshold: 2,
      packageId: process.env.PACKAGE,
      id: dataId,
      data: new TextEncoder().encode("Hello, Seal!"),
    });

  console.log("Encrypted:", encryptedBytes);
  console.log("Backup key:", backupKey);

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

  const result = await suiClient.signAndExecuteTransaction({
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

  console.log("Decrypted:", new TextDecoder().decode(decryptedBytes));
}

main().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});
