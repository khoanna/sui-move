"use client";

import {
  ConnectButton,
  useSignAndExecuteTransaction,
  useCurrentAccount,
  useSuiClientQuery,
  useSuiClient,
} from "@mysten/dapp-kit";
import {Transaction} from "@mysten/sui/transactions";
import {useState} from "react";

export default function Home() {
  const account = useCurrentAccount();
  const {mutate: signAndExecute} = useSignAndExecuteTransaction();
  const client = useSuiClient();

  const packageId =
    "0xc4f7eb7b3a103a5570988a3a99a5f24f9348b2e25092261bb40517dea3e1dfd2";

  const [text, setText] = useState<string>("");
  const [objectId, setObjectId] = useState<string>("");

  const {data, isLoading, error} = useSuiClientQuery("getObject", {
    id: objectId,
    options: {showContent: true},
  });

  const handleClick = () => {
    const tx = new Transaction();
    tx.moveCall({
      target: `${packageId}::hello_move::create_greeting`,
      arguments: [tx.pure.string(text)],
    });

    signAndExecute(
      {
        transaction: tx,
        chain: "sui:testnet",
      },
      {
        onSuccess: async (res) => {
          const txResult = await client.waitForTransaction({
            digest: res.digest,
            options: {showEffects: true, showObjectChanges: true},
          });
          setObjectId(txResult.effects?.created?.[0].reference.objectId || "");
        },
        onError: (err) => console.error("❌", err),
      }
    );
  };

  if (!account) {
    return <ConnectButton />;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Welcome, {account.address}!</h1>
      
      <div className="mb-4">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter message"
          className="p-2 border rounded-xl"
        />
        <button
          onClick={handleClick}
          className="ml-4 cursor-pointer bg-gray-300 hover:bg-gray-400 p-2 rounded-full"
        >
          Send Message
        </button>
      </div>

      {/* Display Object Data */}
      {objectId && (
        <div className="mt-6 p-4 border rounded-lg bg-gray-50">
          <h2 className="text-xl font-semibold mb-2">Object Data:</h2>
          
          {isLoading && <p>Loading...</p>}
          
          {error && <p className="text-red-500">Error: {error.message}</p>}
          
          {data && (
            <div className="space-y-2">
              <p><strong>Object ID:</strong> {objectId}</p>
              <div className="bg-white p-3 rounded">
                <strong>Content:</strong>
                <pre className="mt-2 overflow-auto">
                  {JSON.stringify(data, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}