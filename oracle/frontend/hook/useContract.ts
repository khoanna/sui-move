import {ADMIN_CAP, PACKAGE_ID, USER_POINT} from "@/lib/constant";
import {OracleObject} from "@/type/Oracle";
import {useSignAndExecuteTransaction, useSuiClient} from "@mysten/dapp-kit";
import {Transaction} from "@mysten/sui/transactions";
import {useState} from "react";

export default function useContract({address}: {address?: string}) {
  const client = useSuiClient();
  const {mutate: signAndExecute} = useSignAndExecuteTransaction();
  const [contractLoading, setContractLoading] = useState(false);

  const fetchOracleData = async (oracleId: string) => {
    try {
      const oracle = await client.getObject({
        id: oracleId,
        options: {showContent: true, showType: true},
      });
      if (
        !oracle?.data?.content ||
        oracle.data.content.dataType !== "moveObject"
      ) {
        console.error("Invalid oracle object");
        return null;
      }
      const oracleData = oracle.data.content.fields as unknown as OracleObject;
      return oracleData;
    } catch (error) {
      console.error("Error fetching oracle data:", error);
      return null;
    }
  };

  const fetchUserPrediction = async (predictionId: string) => {
    try {
      const prediction = await client.getObject({
        id: predictionId,
        options: {showContent: true, showType: true},
      });
      
      if (
        !prediction?.data?.content ||
        prediction.data.content.dataType !== "moveObject"
      ) {
        console.error("Invalid prediction object");
        return null;
      }

      const content = prediction.data.content as unknown as {
        fields: {
          predictions: {
            fields: {
              id: { id: string };
            };
          };
        };
      };

      const predictionsParentId = content.fields?.predictions?.fields?.id?.id;
      
      if (!predictionsParentId) {
        return null;
      }

      const fields = await client.getDynamicFields({
        parentId: predictionsParentId,
      });

      const userField = fields.data.find((field) => {
        const name = field.name as {type: string; value: string};
        return name?.value === address;
      });

      if (!userField) {
        return null;
      }

      const predictionObject = await client.getObject({
        id: userField.objectId,
        options: {showContent: true},
      });

      if (!predictionObject?.data?.content || predictionObject.data.content.dataType !== 'moveObject') {
        return null;
      }

      const predictionContent = predictionObject.data.content as unknown as {
        fields: { value: boolean };
      };
      console.log(predictionContent);
      
      return predictionContent.fields?.value;
    } catch (error) {
      console.error("Error fetching user prediction:", error);
      return null;
    }
  };

  const fetchOracleTemperature = async (oracleId: string) => {
    setContractLoading(true);
    try {
      const oracleData = await fetchOracleData(oracleId);
      setContractLoading(false);
      return oracleData?.temperature;
    } catch (error) {
      setContractLoading(false);
      throw error;
    }
  };

  const predict = async (
    oracle_id: string,
    predict_id: string,
    prediction: boolean
  ) => {
    setContractLoading(true);
    try {
      const tx = new Transaction();
      tx.moveCall({
        target: `${PACKAGE_ID}::contract::make_prediction`,
        typeArguments: [],
        arguments: [tx.object(predict_id), tx.pure.bool(prediction)],
      });

      return new Promise((resolve, reject) => {
        signAndExecute(
          {transaction: tx},
          {
            onSuccess: async (res) => {
              try {
                await client.waitForTransaction({
                  digest: res.digest,
                });
                setContractLoading(false);
                resolve(res);
              } catch (error) {
                setContractLoading(false);
                reject(error);
              }
            },
            onError: (err) => {
              console.error("Transaction failed:", err);
              setContractLoading(false);
              reject(err);
            },
          }
        );
      });
    } catch (error) {
      setContractLoading(false);
      throw error;
    }
  };

  const claimPoint = async (predict_id: string, oracle_id: string) => {
    setContractLoading(true);
    try {
      const tx = new Transaction();
      tx.moveCall({
        target: `${PACKAGE_ID}::contract::claim_point`,
        typeArguments: [],
        arguments: [
          tx.object(USER_POINT),
          tx.object(predict_id),
          tx.object(oracle_id),
        ],
      });

      return new Promise((resolve, reject) => {
        signAndExecute(
          {transaction: tx},
          {
            onSuccess: async (res) => {
              try {
                await client.waitForTransaction({
                  digest: res.digest,
                });
                setContractLoading(false);
                resolve(res);
              } catch (error) {
                setContractLoading(false);
                reject(error);
              }
            },
            onError: (err) => {
              console.error("Transaction failed:", err);
              setContractLoading(false);
              reject(err);
            },
          }
        );
      });
    } catch (error) {
      setContractLoading(false);
      throw error;
    }
  };

  const fetchUserPoint = async () => {
    const userPointMapping = await client.getObject({
      id: USER_POINT,
      options: {showContent: true, showType: true},
    });
    if (
      !userPointMapping?.data?.content ||
      userPointMapping.data.content.dataType !== "moveObject"
    ) {
      console.error("Invalid PlayingBoard object");
      setContractLoading(false);
      return;
    }

    const content = userPointMapping.data.content as unknown as {
      dataType: "moveObject";
      fields: {
        id: {id: string};
        mapping: {
          fields: {
            id: {id: string};
          };
        };
      };
    };
    const pointParentId = content.fields?.mapping?.fields?.id?.id;
    if (!pointParentId) {
      setContractLoading(false);
      return;
    }
    const fields = await client.getDynamicFields({
      parentId: pointParentId,
    });
    const userField = fields.data.find((field) => {
      const name = field.name as {type: string; value: string};
      return name?.value === address;
    });
    const pointIdObject = await client.getObject({
      id: userField?.objectId!,
      options: {showContent: true},
    });
    if (!pointIdObject?.data?.content || pointIdObject.data.content.dataType !== 'moveObject') {
        console.error("Invalid board ID object");
        setContractLoading(false);
        return;
      }

      const pointIdContent = pointIdObject.data.content as unknown as {
        fields: { value: string };
      };
      const pointId = pointIdContent.fields?.value;

      if (!pointId) {
        console.error("point ID not found");
        setContractLoading(false);
        return;
      }

      const pointObject = await client.getObject({
        id: pointId,
        options: {showContent: true},
      });

      if (!pointObject?.data?.content || pointObject.data.content.dataType !== 'moveObject') {
        console.error("Invalid point object");
        setContractLoading(false);
        return;
      }

      const pointContent = pointObject.data.content;
      const pointData = pointContent.fields as unknown as { point: number };
      setContractLoading(false);
      return pointData.point;
    
  };

  return {
    contractLoading,
    fetchOracleData,
    fetchUserPrediction,
    fetchOracleTemperature,
    predict,
    claimPoint,
    fetchUserPoint,
  };
}
