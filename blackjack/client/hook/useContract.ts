import {MAPPING_ID, PACKAGE_ID, RANDOM_ID} from "@/lib/constants";
import {Game} from "@/type/Game";
import {useSignAndExecuteTransaction, useSuiClient} from "@mysten/dapp-kit";
import {Transaction} from "@mysten/sui/transactions";
import {useState} from "react";

export default function useContract({
  address,
  setCurrentGame,
}: {
  address?: string;
  setCurrentGame: React.Dispatch<React.SetStateAction<Game | null>>;
}) {
  const client = useSuiClient();
  const [contractLoading, setContractLoading] = useState(false);
  const {mutate: signAndExecute} = useSignAndExecuteTransaction();

  const fetchCurrentGame = async () => {
    if (!address) {
      setCurrentGame(null);
      return;
    }
    setContractLoading(true);
    try {
      const mappingObjects = await client.getObject({
        id: MAPPING_ID,
        options: {showContent: true},
      });

      if (
        !mappingObjects?.data?.content ||
        mappingObjects.data.content.dataType !== "moveObject"
      ) {
        console.error("Invalid PlayingBoard object");
        setContractLoading(false);
        setCurrentGame(null);
        return;
      }

      const content = mappingObjects.data.content as unknown as {
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
      const gameId = content.fields?.mapping?.fields?.id?.id;
      if (!gameId) {
        console.error("Game ID not found");
        setContractLoading(false);
        setCurrentGame(null);
        return;
      }

      const fields = await client.getDynamicFields({
        parentId: gameId,
      });

      const userField = fields.data.find((field) => {
        const name = field.name as {type: string; value: string};
        return name?.value === address;
      });

      if (!userField) {
        console.log("No current board found for this account.");
        setContractLoading(false);
        setCurrentGame(null);
        return;
      }

      const gameIdObject = await client.getObject({
        id: userField.objectId,
        options: {showContent: true},
      });

      if (
        !gameIdObject?.data?.content ||
        gameIdObject.data.content.dataType !== "moveObject"
      ) {
        console.error("Invalid board ID object");
        setContractLoading(false);
        setCurrentGame(null);
        return;
      }
      console.log(gameIdObject);

      if (!gameIdObject.data.content) {
        console.error("No current board found for this account.");
        setContractLoading(false);
        setCurrentGame(null);
        return;
      }

      const boardIdContent = gameIdObject.data.content as unknown as {
        fields: {value: string};
      };

      const gameObject = await client.getObject({
        id: boardIdContent.fields.value,
        options: {showContent: true},
      });
      console.log(gameObject);

      if (
        !gameObject?.data?.content ||
        gameObject.data.content.dataType !== "moveObject"
      ) {
        console.error("Invalid game object");
        setContractLoading(false);
        setCurrentGame(null);
        return;
      }

      const gameContent = gameObject.data.content.fields as unknown as Game;

      setCurrentGame({
        ...gameContent,
        id: boardIdContent.fields.value,
      });
      setContractLoading(false);
    } catch (error) {
      console.error("Error fetching board:", error);
      setContractLoading(false);
      setCurrentGame(null);
    }
  };

  const createGame = async () => {
    if (!address) {
      console.error("No address found");
      return;
    }
    setContractLoading(true);
    const tx = new Transaction();
    tx.moveCall({
      target: `${PACKAGE_ID}::contract::create_game`,
      typeArguments: [],
      arguments: [tx.object(MAPPING_ID), tx.object(RANDOM_ID)],
    });
    signAndExecute(
      {transaction: tx},
      {
        onSuccess: async (res) => {
          await client.waitForTransaction({
            digest: res.digest,
          });
          await fetchCurrentGame();
          setContractLoading(false);
        },
        onError: (err) => {
          console.error("Transaction failed:", err);
          setContractLoading(false);
        },
      }
    );
  };

  const hit = async (gameId: string) => {
    if (!address) {
      console.error("No address found");
      return;
    }
    setContractLoading(true);
    const tx = new Transaction();
    tx.moveCall({
      target: `${PACKAGE_ID}::contract::hit`,
      typeArguments: [],
      arguments: [tx.object(gameId), tx.object(RANDOM_ID)],
    });
    signAndExecute(
      {transaction: tx},
      {
        onSuccess: async (res) => {
          await client.waitForTransaction({
            digest: res.digest,
          });
          await fetchCurrentGame();
          setContractLoading(false);
        },
        onError: (err) => {
          console.error("Transaction failed:", err);
          setContractLoading(false);
        },
      }
    );
  };

  const stand = async (gameId: string) => {
    if (!address) {
      console.error("No address found");
      return;
    }
    setContractLoading(true);
    const tx = new Transaction();
    tx.moveCall({
      target: `${PACKAGE_ID}::contract::stand`,
      typeArguments: [],
      arguments: [tx.object(gameId), tx.object(RANDOM_ID)],
    });
    signAndExecute(
      {transaction: tx},
      {
        onSuccess: async (res) => {
          await client.waitForTransaction({
            digest: res.digest,
          });
          await fetchCurrentGame();
          setContractLoading(false);
        },
        onError: (err) => {
          console.error("Transaction failed:", err);
          setContractLoading(false);
        },
      }
    );
  };

  return {fetchCurrentGame, createGame, hit, stand, contractLoading};
}
