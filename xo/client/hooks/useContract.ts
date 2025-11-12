import {PACKAGE_ID, PLAYING_BOARD_ID} from "@/lib/constants";
import {Board} from "@/type/Board";
import {
  useCurrentAccount,
  useSignAndExecuteTransaction,
  useSuiClient,
} from "@mysten/dapp-kit";
import {Transaction} from "@mysten/sui/transactions";
import {useState} from "react";

export default function useContract(address?: string, setCurrentBoard?: React.Dispatch<React.SetStateAction<Board | null>>) {
  const client = useSuiClient();
  const [contractLoading, setContractLoading] = useState(false);
  const {mutate: signAndExecute} = useSignAndExecuteTransaction();

  const fetchCurrentBoard = async () => {
    if (!address) {
      setCurrentBoard?.(null);
      return;
    }

    setContractLoading(true);
    try {
      const mappingObjects = await client.getObject({
        id: PLAYING_BOARD_ID,
        options: {showContent: true},
      });

      if (!mappingObjects?.data?.content || mappingObjects.data.content.dataType !== 'moveObject') {
        console.error("Invalid PlayingBoard object");
        setContractLoading(false);
        setCurrentBoard?.(null);
        return;
      }

      const content = mappingObjects.data.content as unknown as {
        dataType: 'moveObject';
        fields: {
          id: { id: string };
          mapping: {
            fields: {
              id: { id: string };
            };
          };
        };
      };
      const tableId = content.fields?.mapping?.fields?.id?.id;

      if (!tableId) {
        console.error("Table ID not found");
        setContractLoading(false);
        setCurrentBoard?.(null);
        return;
      }

      const fields = await client.getDynamicFields({
        parentId: tableId,
      });

      const userField = fields.data.find((field) => {
        const name = field.name as { type: string; value: string };
        return name?.value === address;
      });

      if (!userField) {
        console.log("No current board found for this account.");
        setContractLoading(false);
        setCurrentBoard?.(null);
        return;
      }

      const boardIdObject = await client.getObject({
        id: userField.objectId,
        options: {showContent: true},
      });

      if (!boardIdObject?.data?.content || boardIdObject.data.content.dataType !== 'moveObject') {
        console.error("Invalid board ID object");
        setContractLoading(false);
        setCurrentBoard?.(null);
        return;
      }

      const boardIdContent = boardIdObject.data.content as unknown as {
        fields: { value: string };
      };
      const boardId = boardIdContent.fields?.value;

      if (!boardId) {
        console.error("Board ID not found");
        setContractLoading(false);
        setCurrentBoard?.(null);
        return;
      }

      const boardObject = await client.getObject({
        id: boardId,
        options: {showContent: true},
      });

      if (!boardObject?.data?.content || boardObject.data.content.dataType !== 'moveObject') {
        console.error("Invalid board object");
        setContractLoading(false);
        setCurrentBoard?.(null);
        return;
      }

      const boardContent = boardObject.data.content;
      const boardFields = boardContent.fields as unknown as Board;
      
      setCurrentBoard?.({
        ...boardFields,
        id: boardId
      });
      setContractLoading(false);
    } catch (error) {
      console.error("Error fetching board:", error);
      setContractLoading(false);
      setCurrentBoard?.(null);
    }
  };

  const playGame = async (currentBoardId: string, position: number) => {
    if (!address) {
      console.error("No address found");
      return;
    }

    setContractLoading(true);

    const tx = new Transaction();
    tx.moveCall({
      target:
        `${PACKAGE_ID}::contract::play_game`,
      typeArguments: [],
      arguments: [
        tx.object(PLAYING_BOARD_ID),
        tx.object(currentBoardId),
        tx.pure.u8(position),
      ],
    });

    signAndExecute(
      {transaction: tx},
      {
        onSuccess: async (res) => {
          await client.waitForTransaction({
            digest: res.digest,
          });
          await fetchCurrentBoard();
          setContractLoading(false);
        },
        onError: (err) => {
          console.error("Transaction failed:", err);
          setContractLoading(false);
        }
      }
    );
  };

  const createBoard = async (opponentAddress: string) => {
    if (!address) {
      console.error("No address found");
      return;
    }

    setContractLoading(true);

    const tx = new Transaction();
    tx.moveCall({
      target: `${PACKAGE_ID}::contract::create_board`,
      typeArguments: [],
      arguments: [
        tx.object(PLAYING_BOARD_ID),
        tx.pure.address(opponentAddress),
      ],
    });

    signAndExecute(
      {transaction: tx},
      {
        onSuccess: async (res) => {
          await client.waitForTransaction({
            digest: res.digest,
          });
          await fetchCurrentBoard();
          setContractLoading(false);
        },
        onError: (err) => {
          console.error("Create board failed:", err);
          setContractLoading(false);
        }
      }
    );
  };

  return {
    fetchCurrentBoard,
    playGame,
    createBoard,
    contractLoading,
  };
}
