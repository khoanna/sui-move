import {SuiClient} from "@mysten/sui/client";
import {Transaction} from "@mysten/sui/transactions";
import { TEMP_DECIMAL } from "../lib/constants.js";
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';

const client = new SuiClient({
  url: "https://fullnode.testnet.sui.io:443",
});

const privateKey = process.env.ADMIN_PHRASE;
const keypair = Ed25519Keypair.fromSecretKey(privateKey);

export async function createOracle(
  city_name,
  temperature,
  target_temp,
  target_time
) {
  
  let tx = new Transaction();
  
  tx.moveCall({
    target: `${process.env.PACKAGE_ID}::contract::create_weather_oracle`,
    arguments: [
      tx.object(process.env.ADMIN_CAP),
      tx.pure.string(city_name),
      tx.pure.u64(Math.round(temperature * TEMP_DECIMAL)),
      tx.pure.u64(Math.round(target_temp * TEMP_DECIMAL)),
      tx.pure.u64(target_time),
    ],
  });

  const response = await client.signAndExecuteTransaction({
    transaction: tx,
    signer: keypair,
    options: {
      showEffects: true,
      showObjectChanges: true,
    },
    requestType: 'WaitForLocalExecution',
  });
  
  const createdOracleObject = response.objectChanges?.filter(
    (obj) => obj.type === "created" && obj.objectType.includes("WeatherOracle")
  );
  const oracleId = createdOracleObject?.[0]?.objectId;

  const userPredictionObject = response.objectChanges?.filter(
    (obj) => obj.type === "created" && obj.objectType.includes("UserPrediction")
  );
  const userPredictionId = userPredictionObject?.[0]?.objectId;

  return { oracleId, userPredictionId };
}

export const updateOracles = async (oracleId, new_temp, ended) => {  
    let tx = new Transaction();
    tx.moveCall({
      target: `${process.env.PACKAGE_ID}::contract::update_weather_oracle`,
      arguments: [
        tx.object(process.env.ADMIN_CAP),
        tx.object(oracleId),
        tx.pure.u64(Math.round(new_temp * TEMP_DECIMAL)),
        tx.pure.bool(ended),
      ],
    });

    const response = await client.signAndExecuteTransaction({
      transaction: tx,
      signer: keypair,
      options: {
        showEffects: true,
      },
      requestType: 'WaitForLocalExecution',
    });
    
    return response;
}