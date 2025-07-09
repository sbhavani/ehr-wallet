# EHR Wallet PRD

## 1. Introduction

EHR Wallet is a decentralized application that empowers patients to securely own, manage, and share their health data. By leveraging blockchain technology, we provide a transparent and tamper-proof platform for patients to control who can access their sensitive medical information.

## 2. Current Features

Based on the current codebase, the application includes the following features:

*   **Patient Authentication:** Patients can create an account and log in to the platform.
*   **Patient Dashboard:** A central hub for patients to view their health information.
*   **Data Sharing:** Patients can share their health data with specified third parties.
*   **Access Logs:** A record of who has accessed a patient's data, providing transparency and security.
*   **Wallet:** A section for managing health-related assets, although the full functionality is yet to be defined.
*   **Settings:** Options for patients to manage their account settings.

## 3. Proposed Features & Roadmap

To enhance the EHR Wallet, we propose the following features, prioritized for development:

### Priority 1: Enhance Core Functionality

*   **Detailed Patient Profile:** Allow patients to add more detailed personal and medical information to their profiles, such as allergies, medications, and emergency contacts.
*   **File Uploads:** Enable patients to upload and store medical documents (e.g., lab results, prescriptions) securely on IPFS.
*   **Improved Data Sharing Controls:** Give patients more granular control over data sharing, including the ability to set expiration dates for shared access and revoke permissions.

### Priority 2: Expand Wallet & Integration

*   **Healthcare Provider Integration:** Develop a portal for healthcare providers to request access to patient data, with patient approval required.
*   **Insurance & Billing Management:** Integrate functionality for patients to manage their health insurance information and track medical bills.
*   **Tokenization of Health Data:** Explore the possibility of allowing patients to tokenize their anonymized health data for research purposes, with the ability to earn rewards.

### Priority 3: User Experience & Accessibility

*   **Mobile-First Design:** Ensure the application is fully responsive and optimized for mobile devices.
*   **Notifications:** Implement a notification system to alert patients of important events, such as data access requests or expiring permissions.
*   **Multi-Language Support:** Add support for multiple languages to make the platform accessible to a wider audience.

## 4. Success Metrics

We will measure the success of these new features through the following metrics:

*   **User Adoption:** Number of active users and new account registrations.
*   **Feature Engagement:** Frequency of use for key features like data sharing and file uploads.
*   **User Satisfaction:** Feedback from user surveys and support requests.
*   **Data Security:** Number of security incidents and time to resolution.

## 5. Security Considerations

*   **Data Encryption:** THIS IS CRITICAL. Data stored on IPFS **must** be strongly encrypted. The encryption key should be:
    *   Derived from the optional password set by the patient, OR
    *   A randomly generated key that is appended to the share link as a URL fragment (e.g., `.../view-shared?id=XYZ#key=ABCDEF`). The fragment is not sent to the server.
    *   Never store raw encryption keys in the smart contract or IPFS directly alongside unencrypted data.
*   **Smart Contract Audits:** Before deploying to mainnet, get your `AccessControl.sol` contract audited by a reputable firm.
*   **Input Validation:** Validate all inputs on frontend and (if applicable) backend.
*   **Gas Costs:** All transactions on Ethereum (like `createAccess`) cost gas. Inform users or design the system to minimize transactions.
*   **Password Security:** If passwords are used, ensure they are not trivial. Guide users to create strong passwords. Hashing is done on-chain, but input should be handled securely.
*   **IPFS Pinning:** Data on IPFS is only guaranteed to persist if it's pinned. Use a pinning service (Pinata, Infura) or run your own IPFS node that pins the CIDs.
*   **Replay Attacks:** The smart contract nonce mechanism (implicit in `block.timestamp` usage for `accessId` generation) helps, but ensure signed messages for login also have nonces.
*   **Error Handling:** Provide clear, user-friendly error messages for blockchain errors, IPFS issues, or decryption failures.

## 6. Testing

*   **Smart Contract:** Use Hardhat/Truffle for unit tests (e.g., access creation, verification with/without password, expiry).
*   **Frontend:** Test MetaMask connection, form submissions, QR generation, data display.
*   **Integration:** Full end-to-end tests on a testnet (e.g., patient shares, provider views).
*   **Security Testing:** Penetration testing, especially around encryption and access control.

## 7. Deployment

1.  **Smart Contract:** Deploy `AccessControl.sol` to your chosen Ethereum network (testnet first, then mainnet). Update the contract address in your `.env.local`.
2.  **Next.js Application:** Deploy to a platform like Vercel, Netlify, or your own server.

## 8. Future Enhancements

*   **Access Revocation:** Allow patients to revoke an active share via a smart contract function.
*   **Granular Data Selection:** More detailed checkboxes for specific data points within categories.
*   **Provider Identity Verification:** Share directly with a provider's Ethereum address.
*   **Audit Trails:** On-chain or off-chain logs of who accessed what and when (balancing privacy).
*   **Gasless Transactions:** Explore meta-transactions for patients if gas fees are a concern.

## 9. Implementation Roadmap (MoSCoW)

### Must Have
*   **Detailed Patient Profile:** Implement UI and backend to allow patients to add and edit personal details, allergies, medications, and emergency contacts.
*   **Enhanced Data Sharing Controls:** Build the interface for patients to set granular permissions, including time-limited access and easy revocation for shared data.

### Should Have
*   **Healthcare Provider Portal:** A separate interface for verified healthcare providers to request and view patient data (with patient consent).
*   **User Notifications:** Implement email or in-app notifications for key events like data access requests, successful shares, and expiring permissions.
*   **Comprehensive Access Logs:** Detailed and user-friendly logs showing who accessed what data and when.

### Could Have
*   **Tokenization of Anonymized Data:** Explore a system for patients to contribute anonymized data to research pools and earn rewards.
*   **Multi-Language Support:** Add internationalization (i18n) to support multiple languages.
*   **Real-time Telemedicine Features:** Video or chat consultations are out of scope.
*   **Direct EMR/EHR Integration:** No direct integration with hospital or clinic Electronic Medical Record systems in this phase.
*   **Responsive, Mobile-First Design:** Ensure the entire application is fully functional and looks great on mobile devices.

### Won't Have (this time)
*   **Prescription Fulfillment:** No integration with pharmacies for filling prescriptions.
