# ⛅ Weather Oracle - Decentralized Weather Prediction Platform

A full-stack decentralized application (DApp) built on Sui blockchain that allows users to predict weather temperatures and earn points for accurate predictions.

## 📋 Table of Contents

- [Overview](#overview)
- [System Architecture](#system-architecture)
- [Smart Contract Logic](#smart-contract-logic)
- [Backend Oracle Service](#backend-oracle-service)
- [Frontend Application](#frontend-application)
- [Technology Stack](#technology-stack)
- [Installation & Setup](#installation--setup)
- [Project Structure](#project-structure)
- [How It Works](#how-it-works)
- [Environment Variables](#environment-variables)

---

## 🌟 Overview

Weather Oracle is a decentralized prediction market built on the Sui blockchain where:
- **Admins** create weather oracles for specific cities with target temperatures and deadlines
- **Users** predict whether the actual temperature will be higher or lower than the target
- **Backend Oracle** automatically fetches real-time weather data and updates the blockchain
- **Winners** claim points based on accurate predictions

---

## 🏗️ System Architecture

The system consists of three main components:

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (Next.js)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Oracle List  │  │  Prediction  │  │ Points Display│      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │ ▲
                            │ │ RPC calls
                            ▼ │
┌─────────────────────────────────────────────────────────────┐
│                    Sui Blockchain (Testnet)                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Smart Contract (Move)                    │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌───────────┐  │   │
│  │  │WeatherOracle │  │UserPrediction│  │ UserPoint │  │   │
│  │  └──────────────┘  └──────────────┘  └───────────┘  │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ▲ │
                            │ │ Auto-update (every 60s)
                            │ ▼
┌─────────────────────────────────────────────────────────────┐
│                Backend Oracle Service (Node.js)              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Weather API  │  │ Oracle Update│  │  REST API    │      │
│  │  (OpenWeather│  │   Service    │  │  Endpoints   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### Components:

#### 1. **Smart Contract (Sui Move)**
- Deployed on Sui Testnet
- Manages oracle creation, predictions, and point distribution
- Ensures trustless and transparent game logic
- Stores all data on-chain as shared objects

#### 2. **Backend Oracle Service**
- Node.js/Express server acting as the oracle
- Fetches real-time weather data from OpenWeatherMap API
- Automatically updates blockchain state every 60 seconds
- Provides REST API for frontend operations

#### 3. **Frontend Application**
- Next.js 16 with React 19
- Beautiful, responsive UI with Tailwind CSS v4
- Integrates with Sui wallet using @mysten/dapp-kit
- Real-time updates and optimistic UI patterns

---

## 🔐 Smart Contract Logic

### Data Structures

#### **AdminCap**
```move
public struct AdminCap has key, store { id: UID }
```
- **Purpose**: Admin capability object for privileged operations
- **Owner**: Admin wallet address (transferred during contract initialization)
- **Usage**: Required for creating oracles and updating weather data

#### **WeatherOracle**
```move
public struct WeatherOracle has key, store {
    id: UID,
    city: string::String,         // City name
    temperature: u64,              // Current temperature (×1000 for precision)
    target_temp: u64,              // Target temperature to predict against
    target_time: u64,              // Deadline timestamp in milliseconds
    ended: bool,                   // Whether oracle has ended
}
```
- **Purpose**: Represents a weather prediction challenge
- **Sharing**: Shared object accessible by all users
- **Temperature Format**: Stored as `u64` multiplied by 1000 (e.g., 25.5°C = 25500)

#### **UserPrediction**
```move
public struct UserPrediction has key {
    id: UID,
    oracle_id: ID,                              // Associated oracle ID
    predictions: table::Table<address, bool>,   // User predictions (true=higher, false=lower)
}
```
- **Purpose**: Stores all user predictions for a specific oracle
- **Storage**: Dynamic table mapping user addresses to their predictions
- **One-time**: Users can only predict once per oracle

#### **UserPoint**
```move
public struct UserPoint has key {
    id: UID,
    points: table::Table<address, u64>,  // User points ledger
}
```
- **Purpose**: Global points ledger for all users
- **Sharing**: Single shared object for the entire system
- **Accumulation**: Points increment by 1 for each correct prediction

---

### Core Functions

#### **1. init (Constructor)**
```move
fun init(otw: CONTRACT, ctx: &mut TxContext)
```
**Execution**: Runs once during contract deployment

**Process**:
1. Claims package publisher capability
2. Creates `AdminCap` object
3. Creates shared `UserPoint` object with empty points table
4. Transfers `AdminCap` to deployer
5. Shares `UserPoint` globally

**Result**: Admin capability granted to deployer, global point system initialized

---

#### **2. create_weather_oracle**
```move
entry fun create_weather_oracle(
    _: &AdminCap,
    city: string::String,
    temperature: u64,
    target_temp: u64,
    target_time: u64,
    ctx: &mut TxContext
)
```
**Access Control**: Requires `AdminCap` (admin-only)

**Process**:
1. Creates new `WeatherOracle` object with:
   - City name
   - Initial temperature (from weather API)
   - Target temperature (admin-defined prediction threshold)
   - Target time (deadline for predictions)
   - `ended = false` (oracle is active)
2. Creates associated `UserPrediction` object with:
   - Oracle ID reference
   - Empty predictions table
3. Shares both objects globally

**Result**: New oracle available for predictions, linked prediction table created

---

#### **3. make_prediction**
```move
entry fun make_prediction(
    user_prediction: &mut UserPrediction,
    prediction: bool,
    ctx: &TxContext
)
```
**Access Control**: Public (any user can call)

**Parameters**:
- `prediction`: `true` = temperature will be higher, `false` = lower

**Process**:
1. **Validation**: Checks user hasn't already predicted (abort with code 1 if duplicate)
2. **Storage**: Adds user's address and prediction to the table
3. **Immutability**: Prediction cannot be changed after submission

**Assertions**:
- `assert!(!table::contains(&user_prediction.predictions, ctx.sender()), 1)`
  - Error code 1: User already made a prediction

**Result**: User's prediction permanently recorded on-chain

---

#### **4. update_weather_oracle**
```move
entry fun update_weather_oracle(
    _: &AdminCap,
    oracle: &mut WeatherOracle,
    new_temperature: u64,
    ended: bool,
)
```
**Access Control**: Requires `AdminCap` (oracle service only)

**Process**:
1. Updates oracle's current temperature with latest weather data
2. Sets `ended` flag based on deadline check
3. No event emission (data queryable via blockchain state)

**Called by**: Backend oracle service every 60 seconds

**Result**: Oracle reflects current weather conditions

---

#### **5. claim_point**
```move
entry fun claim_point(
    user_point: &mut UserPoint,
    user_prediction: &UserPrediction,
    weather_oracle: &WeatherOracle,
    ctx: &TxContext
)
```
**Access Control**: Public (users claim their own points)

**Process**:
1. **Validation Checks**:
   - User made a prediction (error 2)
   - Oracle has ended (error 4)
   - User's prediction was correct (error 3)
2. **Prediction Logic**:
   ```move
   let predict = *table::borrow(&user_prediction.predictions, ctx.sender());
   let actual_higher = weather_oracle.temperature >= weather_oracle.target_temp;
   assert!(actual_higher == predict, 3);
   ```
   - If `predict = true` and `temperature >= target_temp` → Correct
   - If `predict = false` and `temperature < target_temp` → Correct
3. **Point Distribution**:
   - If user has existing points: increment by 1
   - If new user: initialize with 1 point

**Assertions**:
- Error 2: User didn't make a prediction
- Error 3: Prediction was incorrect
- Error 4: Oracle hasn't ended yet

**Result**: Winner receives 1 point added to global ledger

---

## 🤖 Backend Oracle Service

### Architecture

The backend acts as a **trusted oracle** that bridges off-chain weather data with on-chain smart contracts.

### Key Components

#### **1. Weather Data Fetching**
```javascript
// Fetch current weather from OpenWeatherMap API
const response = await fetch(
  `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric`
);
```
- **API**: OpenWeatherMap Current Weather API
- **Units**: Metric (Celsius)
- **Data**: Temperature, city name, coordinates

#### **2. Oracle Creation**
```javascript
export async function createOracle(city_name, temperature, target_temp, target_time)
```

**Process**:
1. Builds Sui transaction with `create_weather_oracle` call
2. Signs with admin keypair
3. Executes on blockchain
4. Extracts created object IDs from response
5. Returns `{ oracleId, userPredictionId }`

**Transaction Details**:
- **Target**: `PACKAGE_ID::contract::create_weather_oracle`
- **Arguments**:
  - `ADMIN_CAP` object
  - City name (string)
  - Initial temperature × 1000 (u64)
  - Target temperature × 1000 (u64)
  - Target timestamp in milliseconds (u64)

#### **3. Automatic Oracle Updates**
```javascript
export const updateOracles = async (oracleId, new_temp, ended)
```

**Scheduled Execution**:
```javascript
setInterval(async () => {
  const oracles = await getOracles(); // Fetch from database
  
  for (const oracle of oracles) {
    // Fetch current weather
    const weather = await fetchWeatherData(oracle.latitude, oracle.longitude);
    
    // Check if ended
    const ended = Date.now() >= oracle.target_time;
    
    // Update blockchain (sequential to avoid ADMIN_CAP conflicts)
    await updateOracles(oracle.id, weather.temp, ended);
    
    // Wait 1 second before next update
    await sleep(1000);
  }
}, ONE_MINUTE_MS);
```

**Key Design Decisions**:
- **Sequential Updates**: Avoids concurrent transaction conflicts on `ADMIN_CAP`
- **1-second Delay**: Prevents transaction collisions
- **60-second Interval**: Balances freshness with API costs

#### **4. REST API Endpoints**

##### **GET /search**
```javascript
// Search cities by name
GET /search?q=london
Response: [{ name, lat, lon, country, state }]
```

##### **POST /oracle**
```javascript
// Create new oracle
POST /oracle
Body: { cityName, lat, lon, targetTemp, targetTime }
Response: { oracle_id, predict_id }
```

##### **GET /oracles**
```javascript
// Get all oracles
GET /oracles
Response: [{ id, predict_id, city_name, latitude, longitude, target_temp, target_time }]
```

---

## 🎨 Frontend Application

### Features

#### **1. Wallet Integration**
- Connect with Sui wallets (Suiet, Sui Wallet, Ethos)
- Auto-detect network (Testnet required)
- Display wallet address and points

#### **2. Admin Panel**
- Create new oracles with city search
- Set target temperature and deadline
- Preview before creation

#### **3. User Interface**
- View all active oracles
- Make predictions (Higher/Lower)
- Real-time temperature updates
- Claim points for correct predictions
- Optimistic UI updates

#### **4. Design System**
- Tailwind CSS v4
- Gradient backgrounds
- Smooth animations
- Responsive layout (mobile-first)
- Dark mode support

---

## 🛠️ Technology Stack

### Smart Contract
- **Language**: Move
- **Blockchain**: Sui Testnet
- **Framework**: Sui Framework
- **Development**: Sui CLI

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: In-memory (mock.js)
- **API**: OpenWeatherMap API
- **SDK**: @mysten/sui 1.18.0

### Frontend
- **Framework**: Next.js 16.0.2
- **UI Library**: React 19.2.0
- **Styling**: Tailwind CSS v4
- **Wallet**: @mysten/dapp-kit 0.19.8
- **Language**: TypeScript 5

---

## 🚀 Installation & Setup

### Prerequisites
```bash
# Install Sui CLI
cargo install --locked --git https://github.com/MystenLabs/sui.git --branch testnet sui

# Install Node.js 18+
nvm install 18
nvm use 18
```

### 1. Clone Repository
```bash
git clone <repository-url>
cd oracle
```

### 2. Deploy Smart Contract
```bash
cd contract
sui move build
sui client publish --gas-budget 100000000

# Save the following from output:
# - Package ID
# - AdminCap Object ID
# - UserPoint Object ID
```

### 3. Setup Backend
```bash
cd backend
npm install

# Create .env file
cat > .env << EOF
ADMIN_PHRASE=<your-admin-private-key>
PACKAGE_ID=<deployed-package-id>
ADMIN_CAP=<admin-cap-object-id>
USER_POINT=<user-point-object-id>
OPENWEATHER_API_KEY=<your-openweather-api-key>
EOF

# Start server
npm start
```

### 4. Setup Frontend
```bash
cd frontend
npm install

# Create .env.local file
cat > .env.local << EOF
NEXT_PUBLIC_PACKAGE_ID=<deployed-package-id>
NEXT_PUBLIC_ADMIN_CAP=<admin-cap-object-id>
NEXT_PUBLIC_USER_POINT=<user-point-object-id>
EOF

# Start development server
npm run dev
```

---

## 📁 Project Structure

```
oracle/
├── contract/                   # Smart contract (Move)
│   ├── sources/
│   │   └── contract.move      # Main contract logic
│   ├── tests/
│   │   └── contract_tests.move
│   └── Move.toml              # Package manifest
│
├── backend/                    # Oracle service (Node.js)
│   ├── service/
│   │   └── oracle.js          # Blockchain interactions
│   ├── database/
│   │   └── mock.js            # In-memory storage
│   ├── lib/
│   │   └── constants.js       # Constants (TEMP_DECIMAL=1000)
│   ├── index.js               # Express server + auto-update
│   └── package.json
│
├── frontend/                   # Web app (Next.js)
│   ├── app/
│   │   ├── page.tsx           # Main page
│   │   ├── layout.tsx         # Root layout
│   │   └── globals.css        # Global styles
│   ├── components/
│   │   ├── OracleList.tsx     # Oracle cards
│   │   ├── CreateOracleModal.tsx  # Admin create form
│   │   └── UserPointsDisplay.tsx  # Points display
│   ├── hook/
│   │   ├── useContract.ts     # Blockchain hooks
│   │   └── useOracle.ts       # API hooks
│   ├── lib/
│   │   └── constant.ts        # Constants
│   └── type/
│       ├── Oracle.ts          # Oracle type
│       └── City.ts            # City type
│
└── README.md                   # This file
```

---

## 🎮 How It Works

### User Flow

#### **1. Connect Wallet**
```
User → Connect Sui Wallet → Frontend stores address
```

#### **2. View Oracles**
```
Frontend → GET /oracles → Backend → Returns oracle list
Frontend → fetchOracleData() → Sui RPC → Returns on-chain data
Frontend → Merges and displays oracle cards
```

#### **3. Make Prediction**
```
User clicks "Higher" or "Lower"
  ↓
Frontend → Build transaction with make_prediction
  ↓
User signs with wallet
  ↓
Transaction submitted to Sui blockchain
  ↓
Prediction stored in UserPrediction table
  ↓
Frontend updates UI optimistically
```

#### **4. Oracle Updates (Background)**
```
Every 60 seconds:
Backend → Fetch all oracles from database
  ↓
For each oracle:
  Backend → Fetch weather from OpenWeatherMap API
  Backend → Check if expired (now >= target_time)
  Backend → Build transaction with update_weather_oracle
  Backend → Sign with admin keypair
  Backend → Submit to blockchain
  Backend → Wait 1 second (avoid conflicts)
```

#### **5. Claim Points**
```
User clicks "Claim Points" (only if oracle ended + predicted correctly)
  ↓
Frontend → Build transaction with claim_point
  ↓
Smart contract verifies:
  - Oracle has ended ✓
  - User made prediction ✓
  - Prediction matches actual result ✓
  ↓
Contract adds 1 point to user's total
  ↓
Frontend refreshes points display
```

---

## 🔧 Environment Variables

### Backend (.env)
```bash
# Admin wallet private key (hex format)
ADMIN_PHRASE=0x...

# Deployed contract addresses
PACKAGE_ID=0x...
ADMIN_CAP=0x...
USER_POINT=0x...

# OpenWeatherMap API key
OPENWEATHER_API_KEY=your_api_key_here
```

### Frontend (.env.local)
```bash
# Same as backend
NEXT_PUBLIC_PACKAGE_ID=0x...
NEXT_PUBLIC_ADMIN_CAP=0x...
NEXT_PUBLIC_USER_POINT=0x...

# Admin wallet address (for UI checks)
NEXT_PUBLIC_ADMIN_ADDRESS=0x...
```

---

## 🔒 Security Considerations

### Smart Contract
- **AdminCap**: Only admin can create/update oracles
- **One Prediction**: Users can't change predictions after submission
- **Claim Verification**: Triple-checked before awarding points
- **Shared Objects**: All data publicly verifiable on-chain

### Backend Oracle
- **Private Key**: Stored in environment variables (never committed)
- **Sequential Updates**: Prevents transaction conflicts
- **Error Handling**: Retries on failures
- **API Rate Limiting**: Respects OpenWeatherMap limits

### Frontend
- **Wallet Security**: Uses official Sui wallet adapters
- **No Private Keys**: Users sign with their own wallets
- **Input Validation**: All user inputs validated
- **XSS Protection**: React's built-in escaping

---

## 📊 Temperature Precision

**Problem**: Move doesn't support floating-point numbers

**Solution**: Multiply by 1000 before storing
```
25.5°C → Store as 25500 (u64)
On display: 25500 ÷ 1000 = 25.5°C
```

**Constant**: `TEMP_DECIMAL = 1000`

**Applied in**:
- Backend: Before calling `create_weather_oracle` and `update_weather_oracle`
- Frontend: When displaying temperature (divide by 1000)

---

## 🐛 Common Issues & Solutions

### 1. "Object has been deleted"
**Cause**: Trying to use a deleted or transferred object
**Solution**: Use shared objects, not owned objects

### 2. "Transaction locks objects already locked"
**Cause**: Concurrent transactions using same `ADMIN_CAP`
**Solution**: Sequential updates with 1-second delay

### 3. "Expected 1 arguments, but got 2"
**Cause**: Function signature mismatch
**Solution**: Match function parameters exactly

### 4. "Failed to fetch weather"
**Cause**: Invalid API key or rate limit exceeded
**Solution**: Check OpenWeatherMap API key and usage limits

---

**Built with ❤️ on Sui Blockchain**
