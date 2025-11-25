import {PACKAGE_ID} from "@/lib/constant";
import {useSignAndExecuteTransaction, useSuiClient} from "@mysten/dapp-kit";
import {Transaction} from "@mysten/sui/transactions";
import {useState} from "react";

export default function useContract(address: string) {
  const client = useSuiClient();
  const {mutate: signAndExecute} = useSignAndExecuteTransaction();
  const [transactionLoading, setTransactionLoading] = useState(false);

  const lockAsset = async ({
    typeAsset,
    assetId,
  }: {
    typeAsset: string;
    assetId: string;
  }) => {
    setTransactionLoading(true);
    const tx = new Transaction();

    tx.moveCall({
      target: `${PACKAGE_ID}::lock::entry_lock`,
      typeArguments: [typeAsset],
      arguments: [tx.object(assetId)],
    });

    signAndExecute(
      {transaction: tx},
      {
        onSuccess: async (res) => {
          const response = await client.waitForTransaction({
            digest: res.digest,
            options: {showEffects: true, showObjectChanges: true},
          });
          const created = response.objectChanges?.filter(
            (o) => o.type === "created"
          );
          console.log("Lock asset response:", created);
          setTransactionLoading(false);
        },
        onError: (error) => {
          console.error("Error locking asset:", error);
          setTransactionLoading(false);
        },
      }
    );
  };

  const createEscrow = async ({
    assetType,
    assetId,
    exchangeKey,
    receiver,
  }: {
    assetType: string;
    assetId: string;
    exchangeKey: string;
    receiver: string;
  }) => {
    setTransactionLoading(true);
    const tx = new Transaction();

    tx.moveCall({
      target: `${PACKAGE_ID}::escrow::create_escrow`,
      typeArguments: [assetType],
      arguments: [
        tx.object(assetId),
        tx.pure.id(exchangeKey),
        tx.pure.address(receiver),
      ],
    });
    signAndExecute(
      {transaction: tx},
      {
        onSuccess: async (res) => {
          const response = await client.waitForTransaction({
            digest: res.digest,
            options: {showEffects: true, showObjectChanges: true},
          });
          const created = response.objectChanges?.filter(
            (o) => o.type === "created"
          );
          console.log("Create escrow response:", created);
          setTransactionLoading(false);
        },
        onError: (error) => {
          console.error("Error creating escrow:", error);
          setTransactionLoading(false);
        },
      }
    );
  };

  const acceptEscrow = async ({
    escrowAssetType,
    lockedAssetType,
    escrowId,
    keyId,
    lockId,
  }: {
    escrowAssetType: string;
    lockedAssetType: string;
    escrowId: string;
    keyId: string;
    lockId: string;
  }) => {
    setTransactionLoading(true);
    const tx = new Transaction();

    tx.moveCall({
      target: `${PACKAGE_ID}::escrow::swap`,
      typeArguments: [escrowAssetType, lockedAssetType],
      arguments: [tx.object(escrowId), tx.object(keyId), tx.object(lockId)],
    });
    signAndExecute(
      {transaction: tx},
      {
        onSuccess: async (res) => {
          const response = await client.waitForTransaction({
            digest: res.digest,
            options: {showEffects: true, showObjectChanges: true},
          });
          const created = response.objectChanges?.filter(
            (o) => o.type === "created"
          );
          console.log("Accept escrow response:", created);
          setTransactionLoading(false);
        },
        onError: (error) => {
          console.error("Error accepting escrow:", error);
          setTransactionLoading(false);
        },
      }
    );
  };

  const cancelEscrow = async ({
    escrowAssetType,
    escrowId,
  }: {
    escrowAssetType: string;
    escrowId: string;
  }) => {
    setTransactionLoading(true);
    const tx = new Transaction();

    tx.moveCall({
      target: `${PACKAGE_ID}::escrow::cancel`,
      typeArguments: [escrowAssetType],
      arguments: [tx.object(escrowId)],
    });
    signAndExecute(
      {transaction: tx},
      {
        onSuccess: async (res) => {
          const response = await client.waitForTransaction({
            digest: res.digest,
            options: {showEffects: true, showObjectChanges: true},
          });
          const created = response.objectChanges?.filter(
            (o) => o.type === "created"
          );
          console.log("Cancel escrow response:", created);
          setTransactionLoading(false);
        },
        onError: (error) => {
          console.error("Error canceling escrow:", error);
          setTransactionLoading(false);
        },
      }
    );
  };

  return {
    lockAsset,
    createEscrow,
    acceptEscrow,
    cancelEscrow,
    transactionLoading,
  };
}
