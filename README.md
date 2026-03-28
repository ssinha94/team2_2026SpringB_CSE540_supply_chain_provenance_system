# Blockchain-Based Supply Chain Provenance System

## 📝 Project Overview
This project, developed for **CSE 540: Engineering Blockchain Applications** at Arizona State University, focuses on designing a decentralized solution to improve transparency, traceability, and trust across supply chain networks. By applying distributed ledger technology and smart contracts, this system addresses challenges such as fragmented data, limited visibility, and risks of fraud or tampering.

## 👥 Team Members
1. **Adedoyin Keshinro**
2. **Joshua Sabels**
3. **Nicolette Williams**
4. **Santoso Ham**
5. **Sumit Sinha**

---

## 🏗️ System Design
Our system is designed to ensure accountability and data integrity in a multi-party environment.

### 1. Stakeholders & Access Control
We utilize **Role-Based Access Control (RBAC)** to manage data access levels (read/write) and specify valid transactions for each participant:
* **Producers / Manufacturers**: Create and register products on the blockchain.
* **Suppliers / Distributors**: Handle logistics and record custody transfer events.
* **Retailers**: Receive goods, verify authenticity, and update product status.
* **Regulators**: Oversee compliance and audit on-chain records.
* **Consumers**: Access and verify product origin through a user interface.

### 2. The Product Journey
The system tracks the lifecycle of an asset through the following stages:
* **Creation**: Registration with a unique identifier and production details.
* **Shipment**: Recording custody transfer and transport details.
* **Storage**: Logging storage conditions and verification checks.
* **Delivery**: Final ownership transfer and delivery confirmation.

---

## 🛠️ Implementation Strategy
The project utilizes a blockchain-powered architecture to ensure immutability and verifiability of critical records.

* **Smart Contracts**: Written in **Solidity** to handle product registration, status updates, and ownership transfers.
* **Integration**: Implementation will be driven by **JavaScript** (using Web3.js or Ethers.js) to interact with the blockchain layer.
* **User Interface**: A simple web or command-line interface for submitting and viewing product data.
* **Tools**: Development managed via **GitHub** for version control and collaboration.

---

## 📈 Analysis Goals
Following implementation, the team will evaluate the system based on:
* **Performance**: Scalability and gas cost tradeoffs.
* **Comparison**: Evaluating blockchain-based tracking against conventional centralized systems.
* **Challenges**: Discussing real-world hurdles such as privacy, interoperability, and regulation.

---
*This repository serves as the official record of development for CSE 540.*