# Blockchain-Based Supply Chain Provenance System

## Overview
This project implements a supply chain provenance system using an Express.js API, a React frontend, IPFS storage, and a mock Hyperledger Fabric ledger. The system is designed to demonstrate asset registration, ownership transfer, status tracking, verification, and certification in a decentralized supply chain workflow.

## Team Members
- **Nicolette** — auditor role and integrity verification logic
- **Sushant** — manufacturer/distributor workflow and asset lifecycle handling
- **Joshua** — transfer, query, and history tracing functionality
- **Zensparx** — frontend integration and role-based UI behavior

## System Design
The design is covered throughout the documentation and codebase by:
- the `server.js` API layer for authentication, role-based authorization, and asset operations
- `services/fabricService.js` for mock ledger transaction logic, asset history, and auditor validation
- `src/` frontend components for workflow-driven UI, live status updates, and audit verification
- the `chaincode/` folder for modeled supply chain provenance contract logic and registered asset hashes

## Technologies
- Node.js / Express.js
- React
- Mock Hyperledger Fabric logic in `services/fabricService.js`
- IPFS via embedded Helia node
- In-memory token sessions and mock ledger state

## Key Features
- Register assets with off-chain document references stored in IPFS
- Transfer ownership with current-owner verification
- Update supply chain statuses for each asset
- Verify asset authenticity with quality checks and audit history
- Auditor integrity validation with ledger proof, discrepancy detection, and conflict flags
- Issue certifications for regulatory or quality compliance
- Trace full product journey via historical events
- Enforce role-based access control for stakeholders

## User Roles
- **superuser**: full access
- **manufacturer**: register assets, transfer ownership, update status, query
- **distributor**: transfer ownership, update status, verify, query
- **retailer**: transfer ownership, verify, query
- **auditor**: verify, certify, query, trace history, audit integrity

## Supply Chain Flow

```mermaid
sequenceDiagram
    participant M as Manufacturer (Org1)
    participant BC as Hyperledger Fabric Ledger
    participant D as Distributor (Org2)
    participant R as Retailer (Org3)
    participant A as Auditor

    Note over M: RegisterAsset(ID, docHash)
    M->>BC: 1. Submit Registration (Check: Role == 'manufacturer')
    BC-->>M: Transaction Confirmed (Asset Created)

    Note over D: TransferCustody(ID, newOwner)
    D->>BC: 2. Request Transfer (Check: Role == 'distributor')
    BC-->>D: Status Updated: 'IN_TRANSIT'

    Note over R: TransferCustody(ID, newOwner)
    R->>BC: 3. Final Receipt (Check: Role == 'retailer')
    BC-->>R: Status Updated: 'DELIVERED'

    Note over A: Audit Integrity & Certification
    A->>BC: 4. Query Asset / Audit History
    BC-->>A: Returns Full Provenance Trail + Verification Proof
    A->>BC: 5. Apply AUDITED / CERTIFIED / FROZEN status flags
    BC-->>A: Confirmed Auditor Oversight
```

## Setup
```bash
npm install
npm start
```

The application runs from `http://localhost:3000/app` by default.

## Test Accounts
| Username | Password | Role |
|---|---|---|
| superuser | abcd1234 | superuser |
| ssinha94 | abcd1234 | manufacturer |
| josh | abcd1234 | distributor |
| zensparx | abcd1234 | retailer |
| nicolette | abcd1234 | auditor |

## Auditor Flow
1. Login as the auditor using:
   - Username: `nicolette`
   - Password: `abcd1234`
2. Open the **Verify Asset** tab.
3. Enter the asset ID to inspect and click **Verify Integrity**.
4. Confirm the returned audit validation status and compare the current document hash with the original registered hash recorded in `chaincode/assets.json`.
5. If desired, auditors can also apply audit flags using **Mark as Audited**, **Issue Audit Certification**, or **Flag for Review**.
6. Review the **Product Journey** tab to observe live timeline updates and any double-spending alerts when transfer conflicts are detected.

## API Endpoints
All endpoints except `/login` and `/health` require the header:
```
Authorization: Bearer <token>
```

### Authentication
- `POST /login` — authenticate and receive a session token
- `POST /logout` — invalidate current session token
- `GET /profile` — retrieve current user profile

### Asset Operations
- `POST /register` — register a new asset
- `GET /asset/:id` — query asset details
- `PUT /transfer` — transfer asset ownership
- `GET /trace/:id` — retrieve asset history

### Status Updates
- `PUT /status/:id` — update asset journey status
  - Valid statuses: `ORIGINATED`, `SHIPPED`, `RECEIVED`, `DELIVERED`, `VERIFIED`, `DAMAGED`, `LOST`, `AUDITED`, `CERTIFIED`, `FROZEN`
  - Auditor-only flags: `AUDITED`, `CERTIFIED`, `FROZEN`

### Verification
- `POST /verify/:id` — verify asset authenticity and quality
- `GET /verify/:id` — read verification history
- `GET /api/audit/:id` — perform auditor integrity validation, retrieve history audit proof, and detect conflicts or discrepancies

### Certification
- `POST /certifications/:id` — issue asset certification
- `GET /certifications/:id` — read certifications

### IPFS Storage
- `POST /ipfs/upload` — upload JSON metadata to IPFS
- `GET /ipfs/:cid` — retrieve IPFS metadata from IPFS

### System
- `GET /health` — health check endpoint

## Example Requests
### Register Asset
```json
{
  "assetId": "ASSET001",
  "docHash": "bafy..."
}
```

### Transfer Asset
```json
{
  "assetId": "ASSET001",
  "newOwner": "josh"
}
```

### Update Status
```json
{
  "status": "SHIPPED",
  "details": "Shipped via courier at 5°C"
}
```

### Verify Asset
```json
{
  "verificationNotes": "Document authenticity confirmed",
  "qualityCheck": true
}
```

### Issue Certification
```json
{
  "certificationType": "ISO_CERTIFICATION",
  "expiryDate": "2027-05-03",
  "metadata": {
    "standard": "ISO-9001"
  }
}
```

### Verify Integrity (Auditor)
```text
GET /api/audit/ASSET001
Authorization: Bearer <token>
```

## Running the UI
The React app is contained in `src/` and interacts with the Express backend via the same server. Use `npm start` to begin the client and API together.

## Project Structure
- `server.js` — Express API server
- `services/fabricService.js` — mock ledger and business logic
- `services/ipfsService.js` — IPFS helper functions
- `services/auth.js` — user authentication and role checks
- `src/` — React client components
- `chaincode/` — Fabric contract-style chaincode files

## Testing Implementation
```bash
npm test
```

## Notes
- The ledger is currently in-memory for demonstration and grading.
- IPFS uses an embedded Helia node and stores real CIDs.
- Role-based access control is enforced at the API layer.
