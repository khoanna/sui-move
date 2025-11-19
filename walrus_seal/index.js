import {SuiClient, getFullnodeUrl} from "@mysten/sui/client";
import {SealClient} from "@mysten/seal";
import {Ed25519Keypair} from "@mysten/sui/keypairs/ed25519";
import {randomBytes} from "crypto";

import cors from "cors";
import express from "express";
import dotenv from "dotenv";
import encrypt from "./src/seal/encrypt.js";
import decrypt from "./src/seal/decrypt.js";
import upload from "./src/walrus/store.js";
import fetchBlob from "./src/walrus/get.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Add raw body parser for binary data
app.use(express.raw({ type: 'application/octet-stream', limit: '50mb' }));

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

app.post("/upload", async (req, res) => {
  try {
    const buffer = req.body;
    
    if (!buffer || buffer.length === 0) {
      return res.status(400).json({ error: "No file data received" });
    }
    
    const {encryptedBytes} = await encrypt(buffer, sealClient, dataId);
    console.log("Encrypted bytes length:", encryptedBytes.length);
    
    const walrusResponse = await upload(encryptedBytes, 5);
    console.log("Walrus response:", walrusResponse);
    
    const blobId = walrusResponse.newlyCreated.blobObject.blobId;
    res.json({blobId});
  } catch (error) {
    console.error("Error during processing:", error);
    res.status(500).json({ error: error.message || "An error occurred during processing." });
  }
});

app.get("/download/:blobId", async (req, res) => {
  try {
    const {blobId} = req.params;
    const storedBytes = await fetchBlob(blobId);
    const decryptedBytes = await decrypt(
      keypair,
      suiClient,
      sealClient,
      dataId,
      new Uint8Array(storedBytes)
    );
    res.send(Buffer.from(decryptedBytes));
  } catch (error) {
    console.error("Error during processing:", error);
    res.status(500).send("An error occurred during processing.");
  }
});

app.listen(4000, () => {
  console.log("Server is running on port 4000");
});
