import {SuiClient, getFullnodeUrl} from "@mysten/sui/client";
import {SealClient} from "@mysten/seal";
import {Ed25519Keypair} from "@mysten/sui/keypairs/ed25519";
import {randomBytes} from "crypto";

import dotenv from "dotenv";
import fs from "fs/promises";
import encrypt from "./src/seal/encrypt.js";
import decrypt from "./src/seal/decrypt.js";
import upload from "./src/walrus/store.js";
import fetchBlob from "./src/walrus/get.js";

dotenv.config();

const serverObjectIds = [
  "0x73d05d62c18d9374e3ea529e8e0ed6161da1a141a94d3f76ae3fe4e99356db75",
  "0xf5d14a81a982144ae441cd7d64b09027f116a468bd36e7eca494f750591623c8",
];
const keypair = Ed25519Keypair.fromSecretKey(process.env.PHRASE);
const suiClient = new SuiClient({url: getFullnodeUrl("testnet")});
const sealClient = new SealClient({
  suiClient,
  serverConfigs: serverObjectIds.map((id) => ({
    objectId: id,
    weight: 1,
  })),
  verifyKeyServers: false,
});
const dataId = randomBytes(16).toString("hex");

const textInput = new TextEncoder().encode("Hello, World!");
const fileInput = await fs.readFile("input.txt");

async function main() {
  const {encryptedBytes} = await encrypt(fileInput, sealClient, dataId);
  console.log("Encrypted:", encryptedBytes);

  const walrusResponse = await upload(encryptedBytes, 5);

  const blobId = walrusResponse.newlyCreated.blobObject.blobId;
  const storedBytes = await fetchBlob(blobId);

  const decryptedBytes = await decrypt(keypair, suiClient, sealClient, dataId, new Uint8Array(storedBytes));
  await fs.writeFile("output.txt", Buffer.from(decryptedBytes));
}

main().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});
