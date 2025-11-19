"use client";

import {ConnectButton, useCurrentAccount} from "@mysten/dapp-kit";
import useFile from "@/hook/useFile";
import {useState} from "react";
import {Upload, Download, Lock, Unlock, FileText, CheckCircle2} from "lucide-react";

export default function Home() {
  const currentAccount = useCurrentAccount();
  const {fileLoading, uploadFile, downloadFile} = useFile();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [blobId, setBlobId] = useState("");
  const [uploadedBlobId, setUploadedBlobId] = useState("");
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !currentAccount) return;
    
    try {
      const result: any = await uploadFile(selectedFile);
      console.log("Upload result:", result);
      // Assuming the result contains blobId
      if (result?.blobId) {
        setUploadedBlobId(result.blobId);
      }
      setSelectedFile(null);
    } catch (error) {
      console.error("Upload error:", error);
      alert("Upload failed: " + (error as Error).message);
    }
  };

  const handleDownload = async () => {
    if (!blobId) return;
    
    try {
      await downloadFile(blobId);
    } catch (error) {
      console.error("Download error:", error);
      alert("Download failed: " + (error as Error).message);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-linear-to-br from-blue-500 to-purple-600 p-2 rounded-xl">
                <Lock className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Walrus Seal
                </h1>
                <p className="text-sm text-gray-500">Encrypted File Storage</p>
              </div>
            </div>
            <ConnectButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {!currentAccount ? (
          // Not Connected State
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-linear-to-br from-blue-500 to-purple-600 rounded-full mb-6">
              <Lock className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Secure File Storage with Encryption
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Store your files securely on Walrus with end-to-end encryption powered by Sui Seal.
              Connect your wallet to get started.
            </p>
            <div className="inline-block">
              <ConnectButton />
            </div>
            
            {/* Features */}
            <div className="grid md:grid-cols-3 gap-8 mt-16 max-w-4xl mx-auto">
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="bg-blue-100 w-12 h-12 rounded-xl flex items-center justify-center mb-4 mx-auto">
                  <Lock className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">End-to-End Encryption</h3>
                <p className="text-gray-600 text-sm">
                  Files are encrypted before upload using Sui Seal protocol
                </p>
              </div>
              
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="bg-purple-100 w-12 h-12 rounded-xl flex items-center justify-center mb-4 mx-auto">
                  <Unlock className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Decentralized Storage</h3>
                <p className="text-gray-600 text-sm">
                  Stored on Walrus network for maximum availability
                </p>
              </div>
              
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="bg-green-100 w-12 h-12 rounded-xl flex items-center justify-center mb-4 mx-auto">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Full Control</h3>
                <p className="text-gray-600 text-sm">
                  Only you can decrypt and access your files
                </p>
              </div>
            </div>
          </div>
        ) : (
          // Connected State
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Upload Section */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Upload className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Upload File</h2>
              </div>

              {/* Drag & Drop Area */}
              <div
                className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all ${
                  dragActive
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300 hover:border-gray-400"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={fileLoading}
                />
                
                {selectedFile ? (
                  <div className="space-y-4">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
                      <FileText className="w-8 h-8 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{selectedFile.name}</p>
                      <p className="text-sm text-gray-500">
                        {(selectedFile.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedFile(null)}
                      className="text-sm text-red-600 hover:text-red-700 font-medium"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full">
                      <Upload className="w-8 h-8 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-gray-900">
                        Drop your file here
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        or click to browse
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={handleUpload}
                disabled={!selectedFile || fileLoading}
                className={`w-full mt-6 py-4 rounded-xl font-semibold text-white transition-all ${
                  !selectedFile || fileLoading
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-linear-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl"
                }`}
              >
                {fileLoading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Encrypting & Uploading...
                  </span>
                ) : (
                  "Encrypt and Upload to Walrus"
                )}
              </button>

              {uploadedBlobId && (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl">
                  <div className="flex items-start space-x-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-green-900 mb-1">
                        Upload Successful!
                      </p>
                      <p className="text-sm text-green-700 break-all font-mono">
                        Blob ID: {uploadedBlobId}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Download Section */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <Download className="w-5 h-5 text-purple-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Download File</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Blob ID
                  </label>
                  <input
                    type="text"
                    value={blobId}
                    onChange={(e) => setBlobId(e.target.value)}
                    placeholder="Enter blob ID to download..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                    disabled={fileLoading}
                  />
                </div>

                <button
                  onClick={handleDownload}
                  disabled={!blobId || fileLoading}
                  className={`w-full py-4 rounded-xl font-semibold text-white transition-all ${
                    !blobId || fileLoading
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-linear-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 shadow-lg hover:shadow-xl"
                  }`}
                >
                  {fileLoading ? (
                    <span className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Downloading & Decrypting...
                    </span>
                  ) : (
                    "Download and Decrypt from Walrus"
                  )}
                </button>
              </div>

              {/* Info Box */}
              <div className="mt-8 p-4 bg-purple-50 border border-purple-200 rounded-xl">
                <h3 className="font-semibold text-purple-900 mb-2 flex items-center">
                  <Lock className="w-4 h-4 mr-2" />
                  How it works
                </h3>
                <ul className="text-sm text-purple-700 space-y-2">
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Files are encrypted locally before upload</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Stored securely on Walrus decentralized network</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Only you can decrypt with your wallet</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t bg-white/80 backdrop-blur-sm mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-500">
            Powered by{" "}
            <span className="font-semibold text-blue-600">Sui Seal</span> and{" "}
            <span className="font-semibold text-purple-600">Walrus</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
