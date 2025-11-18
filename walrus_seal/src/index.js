import {SuiClient, getFullnodeUrl} from "@mysten/sui/client";
import {SealClient} from "@mysten/seal";
import {Ed25519Keypair} from "@mysten/sui/keypairs/ed25519";
import {randomBytes} from "crypto";
import dotenv from "dotenv";
import encrypt from "./encrypt.js";
import decrypt from "./decrypt.js";
dotenv.config();

const serverObjectIds = [
  "0x73d05d62c18d9374e3ea529e8e0ed6161da1a141a94d3f76ae3fe4e99356db75",
  "0xf5d14a81a982144ae441cd7d64b09027f116a468bd36e7eca494f750591623c8",
];
const keypair = Ed25519Keypair.fromSecretKey(process.env.PHRASE);
const suiClient = new SuiClient({url: getFullnodeUrl("testnet")});
const message = "Hello, World!";
const sealClient = new SealClient({
  suiClient,
  serverConfigs: serverObjectIds.map((id) => ({
    objectId: id,
    weight: 1,
  })),
  verifyKeyServers: false,
});
const dataId = randomBytes(16).toString("hex");

async function main() {
  const {encryptedBytes} = await encrypt(message, sealClient, dataId);
  console.log("Encrypted:", encryptedBytes);

  const decryptedBytes = await decrypt(keypair, suiClient, sealClient, dataId, encryptedBytes);
  console.log("Decrypted:", new TextDecoder().decode(decryptedBytes));
}

main().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});
