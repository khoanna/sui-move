import {useSuiClient} from "@mysten/dapp-kit";
import {SealClient} from "@mysten/seal";
import { walrus } from "@mysten/walrus";
import {randomBytes} from "crypto";

const serverObjectIds = [
  "0x73d05d62c18d9374e3ea529e8e0ed6161da1a141a94d3f76ae3fe4e99356db75",
  "0xf5d14a81a982144ae441cd7d64b09027f116a468bd36e7eca494f750591623c8",
];

export const client = useSuiClient().$extend(
  walrus({
    packageConfig: {
      systemObjectId:
        "0x98ebc47370603fe81d9e15491b2f1443d619d1dab720d586e429ed233e1255c1",
      stakingPoolId:
        "0x20266a17b4f1a216727f3eef5772f8d486a9e3b5e319af80a5b75809c035561d",
    },
  })
);

export const sealClient = new SealClient({
  suiClient: client,
  serverConfigs: serverObjectIds.map((id) => ({
    objectId: id,
    weight: 1,
  })),
  verifyKeyServers: false,
});

export const dataId = randomBytes(16).toString("hex");

export const PACKAGE_ID = process.env.NEXT_PUBLIC_PACKAGE_ID || "";
export const NFT_OBJECT_ID = process.env.NEXT_PUBLIC_NFT_OBJECT_ID || "";
export const PUBLISHER_URL = process.env.NEXT_PUBLIC_PUBLISHER_URL || "";
export const AGGREGATOR_URL = process.env.NEXT_PUBLIC_AGGREGATOR_URL || "";
