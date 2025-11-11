import {COUNTER_ID, PACKAGE_ID} from "@/constant";
import {useSignAndExecuteTransaction, useSuiClient} from "@mysten/dapp-kit";
import {Transaction} from "@mysten/sui/transactions";
import {useState} from "react";

export default function useContract({setCounterValue}: {setCounterValue: (value: number) => void}) {
  const client = useSuiClient();
  const {mutate: signAndExecute} = useSignAndExecuteTransaction();
  const [transactionLoading, setTransactionLoading] = useState(false);

  const fetchCounter = async () => {
    if (!COUNTER_ID) return;
    console.log(1);
    
    try {
      const object = await client.getObject({
        id: COUNTER_ID,
        options: {showContent: true},
      });

      if (object.data?.content && "fields" in object.data.content) {
        const fields = object.data.content.fields as {value: string};
        setCounterValue(Number(fields.value));
      }
    } catch (error) {
      console.error("Error fetching counter:", error);
    }
    
  };

  const handleIncrement = async () => {
    setTransactionLoading(true);
    const tx = new Transaction();

    tx.moveCall({
      target: `${PACKAGE_ID}::contract::increase`,
      arguments: [tx.object(COUNTER_ID)],
    });

    signAndExecute(
      {transaction: tx},
      {
        onSuccess: async (res) => {
            await client.waitForTransaction({
                digest: res.digest,
            })
            await fetchCounter();
            setTransactionLoading(false);
        },
        onError: (error) => {
            console.error("Error incrementing:", error);
            setTransactionLoading(false);
        },
      }
    );
  };

  const handleDecrement = async () => {
    setTransactionLoading(true);
    const tx = new Transaction();

    tx.moveCall({
      target: `${PACKAGE_ID}::contract::decrease`,
      arguments: [tx.object(COUNTER_ID)],
    });

    signAndExecute(
      {transaction: tx},
      {
        onSuccess: async (res) => {
          await client.waitForTransaction({
            digest: res.digest,
          })    
          await fetchCounter();
          setTransactionLoading(false);
        },
        onError: (error) => {
          console.error("Error decrementing:", error);
          setTransactionLoading(false);
        },
      }
    );
  };

  return {
    fetchCounter,
    handleIncrement,
    handleDecrement,
    transactionLoading,
  }
}
