# 🔐 Walrus Seal - Encrypted Decentralized File Storage

A secure file storage solution that combines **Sui Seal's end-to-end encryption** with **Walrus's decentralized storage network**. Upload files with confidence knowing they're encrypted before leaving your device and stored across a distributed network.

## ✨ Features

- 🔒 **End-to-End Encryption** - Files encrypted using Sui Seal protocol before upload
- 🌐 **Decentralized Storage** - Files stored on Walrus distributed storage network
- 🔑 **Wallet-Based Access Control** - Only wallet owner can decrypt files
- 📤 **Drag & Drop Upload** - User-friendly file upload interface
- 📥 **Secure Download** - Automatic decryption on download
- 🎨 **Modern UI** - Beautiful, responsive interface built with Next.js and Tailwind CSS

## 🏗️ Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Frontend  │────▶│   Backend   │────▶│   Walrus    │
│  (Next.js)  │     │  (Express)  │     │  (Storage)  │
└─────────────┘     └─────────────┘     └─────────────┘
                            │
                            │
                            ▼
  ┌─────────────────────────────┐
  │       Sui Seal (Encryption)  │
  └─────────────────────────────┘
```

### How It Works

1. **Upload Flow:**
   - User selects file in frontend
   - File sent to backend server
   - Backend encrypts file using Sui Seal
   - Encrypted data stored on Walrus
   - Returns Blob ID to user

2. **Download Flow:**
   - User provides Blob ID
   - Backend fetches encrypted data from Walrus
   - Decrypts using Sui Seal with user's wallet
   - Returns decrypted file to user

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Sui wallet with testnet SUI tokens
- A Sui wallet private key for the backend

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/yourusername/walrus-seal.git
cd walrus-seal
```

2. **Install backend dependencies:**
```bash
npm install
```

3. **Install frontend dependencies:**
```bash
cd frontend
npm install
cd ..
```

4. **Configure environment variables:**

Create a `.env` file in the root directory:
```env
PHRASE=your_sui_wallet_private_key_here
PACKAGE=0x2143439e5e6d217355b21af16eef5460bd5570974e9417337810ebf6fe2648fa
NFT_OBJECT_ID=your_nft_object_id_here
```

Create a `.env.local` file in the `frontend` directory:
```env
NEXT_PUBLIC_PUBLISHER=https://publisher.walrus-testnet.walrus.space
NEXT_PUBLIC_AGGREGATOR=https://aggregator.walrus-testnet.walrus.space
```

### Running the Application

1. **Start the backend server:**
```bash
node index.js
```
The backend will run on `http://localhost:4000`

2. **Start the frontend (in a new terminal):**
```bash
cd frontend
npm run dev
```
The frontend will run on `http://localhost:3000`

3. **Open your browser:**
Navigate to `http://localhost:3000` and connect your Sui wallet!

## 📁 Project Structure

```
walrus-seal/
├── frontend/                 # Next.js frontend application
│   ├── app/
│   │   ├── page.tsx         # Main UI component
│   │   ├── layout.tsx       # Root layout
│   │   └── globals.css      # Global styles
│   ├── hook/
│   │   └── useFile.ts       # Custom hook for file operations
│   ├── lib/
│   │   └── constant.ts      # Constants and configurations
│   ├── provider/
│   │   └── index.tsx        # Sui wallet provider
│   └── services/
│       └── walrus.ts        # Walrus service functions
├── src/
│   ├── seal/
│   │   ├── encrypt.js       # Seal encryption logic
│   │   └── decrypt.js       # Seal decryption logic
│   └── walrus/
│       ├── store.js         # Upload to Walrus
│       └── get.js           # Fetch from Walrus
├── policy/                   # Sui Move smart contracts
│   └── sources/
│       └── policy.move      # Access control policy
├── index.js                  # Express backend server
├── package.json
└── README.md
```

## 🔧 API Endpoints

### POST `/upload`
Upload and encrypt a file.

**Request:**
- Method: `POST`
- Headers: `Content-Type: application/octet-stream`
- Body: File binary data

**Response:**
```json
{
  "blobId": "abc123..."
}
```

### GET `/download/:blobId`
Download and decrypt a file.

**Request:**
- Method: `GET`
- Params: `blobId` - The Walrus blob identifier

**Response:**
- Binary file data

## 🛠️ Technologies Used

### Frontend
- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **@mysten/dapp-kit** - Sui wallet integration
- **lucide-react** - Icons

### Backend
- **Express.js** - Web server
- **@mysten/sui** - Sui blockchain SDK
- **@mysten/seal** - Encryption library
- **@mysten/walrus** - Decentralized storage

### Blockchain
- **Sui Network** - Layer 1 blockchain
- **Sui Move** - Smart contract language
- **Walrus** - Decentralized storage protocol

## 🔐 Security Features

- **Client-Side Encryption** - Files never leave your device unencrypted
- **Threshold Encryption** - Distributed key management
- **Wallet-Based Authentication** - Only wallet owner can decrypt
- **Policy-Based Access Control** - Smart contract enforced permissions
- **Testnet First** - Safe testing environment

## 🧪 Testing

1. **Deploy the Move contract:**
```bash
cd policy
sui client publish --gas-budget 100000000
```

2. **Update environment variables** with deployed package ID

3. **Test file upload:**
- Connect wallet in the UI
- Drag and drop a test file
- Note the returned Blob ID

4. **Test file download:**
- Paste the Blob ID
- Click download
- Verify file integrity

## 📝 Development

### Backend Development
```bash
# Watch mode (requires nodemon)
npm install -g nodemon
nodemon index.js
```

### Frontend Development
```bash
cd frontend
npm run dev
```

### Build for Production
```bash
cd frontend
npm run build
npm start
```

## 🐛 Troubleshooting

### "Cannot connect to Sui network"
- Ensure you're using testnet
- Check your internet connection
- Verify Sui RPC endpoint is accessible

### "Encryption failed"
- Verify Seal server object IDs are correct
- Check wallet has sufficient SUI for gas fees
- Ensure private key is properly formatted

### "Upload failed"
- Check Walrus network status
- Verify file size is within limits (50MB)
- Ensure backend server is running

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Mysten Labs** - For Sui blockchain and Walrus storage
- **Sui Seal Team** - For the encryption protocol
- **Walrus Team** - For decentralized storage infrastructure

## 📞 Support

- **Documentation:** [Sui Docs](https://docs.sui.io)
- **Walrus Docs:** [Walrus Documentation](https://docs.walrus.site)
- **Issues:** [GitHub Issues](https://github.com/yourusername/walrus-seal/issues)

## 🗺️ Roadmap

- [ ] File sharing with multiple wallets
- [ ] File expiration dates
- [ ] File metadata and tags
- [ ] Bulk upload/download
- [ ] Mobile app
- [ ] Mainnet deployment
- [ ] IPFS integration
- [ ] File versioning

---

**Made with ❤️ using Sui, Walrus, and Seal**

*Secure your files. Own your data.*
