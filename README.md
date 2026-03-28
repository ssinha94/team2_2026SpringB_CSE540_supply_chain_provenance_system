# Blockchain-Based Supply Chain Provenance System

## 📝 Project Description
This project addresses the challenges of fragmented data and manual documentation in modern supply chains. We are developing a decentralized, permissioned system using **Hyperledger Fabric** to create a secure, unified record for tracking assets throughout their lifecycle. 

The system provides transparency and trust by recording key events—such as product registration, shipment dispatch, and ownership transfer—on a tamper-resistant ledger. By digitizing critical documents like bills of lading and linking them to on-chain records, the project ensures real-time visibility and accountability for all participants.

## 👥 Team Members
1. **Adedoyin Keshinro**
2. **Joshua Sabels**
3. **Nicolette Williams**
4. **Santoso Ham**
5. **Sumit Sinha**

---

## 🏗️ System Design & Architecture
The solution utilizes a permissioned network where only approved participants can record transactions.

### 1. Stakeholders & Access Control
We implement **Role-Based Access Control (RBAC)** to enforce business rules:
* **Manufacturers/Producers**: Register new shipment records and metadata hashes.
* **Suppliers / Distributors**: Update ownership and custody changes as goods move.
* **Retailers**: Verify authenticity and receive final shipments.
* **Auditors**: Pull event chains to compare on-chain hashes with off-chain files to prove integrity.

### 2. Data Flow
1. **Register**: A producer creates a shipment record. The chaincode writes the unique ID and metadata hash to the ledger while the full record is stored off-chain.
2. **Transfer**: As custody changes, the chaincode updates the owner and appends the event to the ledger.
3. **Verify**: Stakeholders use the ledger's hashes to verify the authenticity of off-chain documents without needing to view sensitive contents.

---

## 🛠️ Dependencies & Requirements
To run the simulation, the following tools must be installed:

* **Docker & Docker Compose**: For containerized network simulation.
* **Hyperledger Fabric Binaries**: To manage the permissioned network and peer nodes.
* **Node.js / JavaScript**: Used for developing the user interface and client interactions.
* **Chaincode Environment**: Go or Node.js for developing smart contract logic.

---

## 🚀 Usage & Deployment Instructions


---
*This repository serves as the official record of development for CSE 540.*