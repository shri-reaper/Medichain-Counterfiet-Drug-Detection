// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * MediChain - pharmaceutical traceability and counterfeit detection.
 * Ethereum (Sepolia) port of the original Hyperledger Fabric chaincode.
 *
 * Privacy note: a public chain exposes everything. The secret verification code is
 * NEVER stored; only keccak256(code) is. The backend hashes codes before sending.
 * Only the operator (the backend wallet) can write; anyone can read.
 */
contract MediChain {
    struct CustodyEvent { string from; string to; string role; uint256 timestamp; }
    struct VerificationEvent { bytes32 scannedCodeHash; string verifier; string location; string result; uint256 timestamp; }
    struct RecallEvent { string reason; string recalledBy; uint256 timestamp; }
    struct CounterfeitReport { string reportedBy; string location; string details; bool resolved; uint256 timestamp; }

    struct Medicine {
        string medicineId;
        string medicineName;
        string manufacturer;
        string batchNumber;
        string expiryDate;
        string manufacturingLocation;
        uint256 quantity;
        bytes32 codeHash;
        string status;             // ACTIVE | RECALLED
        string authenticityStatus; // UNVERIFIED | GENUINE | COUNTERFEIT | RECALLED
        string currentCustodian;
        string currentRole;
        CustodyEvent[] custodyHistory;
        VerificationEvent[] verificationHistory;
        RecallEvent[] recallHistory;
        CounterfeitReport[] reports;
        uint256 createdAt;
        uint256 lastUpdatedAt;
    }

    address public owner;
    address public operator;

    mapping(bytes32 => Medicine) private medicines; // key = keccak256(medicineId)
    mapping(bytes32 => bool) private exists;
    mapping(bytes32 => bool) private batchUsed;
    mapping(bytes32 => bool) private codeUsed;
    string[] private ids;

    event MedicineCreated(string medicineId, string manufacturer);
    event MedicineVerified(string medicineId, string result, string verifier);
    event MedicineTransferred(string medicineId, string toCustodian, string role);
    event MedicineRecalled(string medicineId, string recalledBy);
    event CounterfeitReported(string medicineId, string reportedBy, string location);

    modifier onlyOperator() {
        require(msg.sender == operator, "Only the operator can write");
        _;
    }

    constructor() {
        owner = msg.sender;
        operator = msg.sender;
    }

    function setOperator(address newOperator) external {
        require(msg.sender == owner, "Only the owner can set the operator");
        require(newOperator != address(0), "Invalid operator");
        operator = newOperator;
    }

    function _key(string memory id) private pure returns (bytes32) {
        return keccak256(bytes(id));
    }

    function _req(string memory v, string memory field) private pure {
        require(bytes(v).length > 0, string.concat(field, " is required"));
    }

    function _load(string memory id) private view returns (Medicine storage m) {
        bytes32 k = _key(id);
        require(exists[k], string.concat("Medicine ", id, " does not exist"));
        m = medicines[k];
    }

    struct NewMedicine {
        string medicineId;
        string medicineName;
        string manufacturer;
        string batchNumber;
        string expiryDate;
        string manufacturingLocation;
        uint256 quantity;
        bytes32 codeHash;
    }

    function createMedicine(NewMedicine calldata p) external onlyOperator {
        _req(p.medicineId, "Medicine ID");
        _req(p.medicineName, "Medicine name");
        _req(p.manufacturer, "Manufacturer");
        _req(p.batchNumber, "Batch number");
        _req(p.expiryDate, "Expiry date");
        _req(p.manufacturingLocation, "Manufacturing location");
        require(p.quantity > 0, "Quantity must be a positive number");
        require(p.codeHash != bytes32(0), "Verification code is required");

        bytes32 k = _key(p.medicineId);
        bytes32 bk = keccak256(bytes(p.batchNumber));
        require(!exists[k], string.concat("Registration failed: Ledger ID ", p.medicineId, " already exists"));
        require(!codeUsed[p.codeHash], "Registration failed: That exact Cryptographic Secret Payload is already in use.");
        require(!batchUsed[bk], string.concat("Registration failed: Production Batch No. ", p.batchNumber, " is already registered."));

        exists[k] = true;
        codeUsed[p.codeHash] = true;
        batchUsed[bk] = true;
        ids.push(p.medicineId);

        Medicine storage m = medicines[k];
        m.medicineId = p.medicineId;
        m.medicineName = p.medicineName;
        m.manufacturer = p.manufacturer;
        m.batchNumber = p.batchNumber;
        m.expiryDate = p.expiryDate;
        m.manufacturingLocation = p.manufacturingLocation;
        m.quantity = p.quantity;
        m.codeHash = p.codeHash;
        m.status = "ACTIVE";
        m.authenticityStatus = "UNVERIFIED";
        m.currentCustodian = p.manufacturer;
        m.currentRole = "MANUFACTURER";
        m.custodyHistory.push(CustodyEvent("ORIGIN", p.manufacturer, "MANUFACTURER", block.timestamp));
        m.createdAt = block.timestamp;
        m.lastUpdatedAt = block.timestamp;

        emit MedicineCreated(p.medicineId, p.manufacturer);
    }

    function verifyMedicine(
        string calldata medicineId,
        bytes32 scannedCodeHash,
        string calldata verifier,
        string calldata location
    ) external onlyOperator {
        _req(verifier, "Verifier");
        Medicine storage m = _load(medicineId);
        require(!_is(m.status, "RECALLED"), "Action blocked on-chain: Asset is permanently recalled.");

        bool ok = scannedCodeHash == m.codeHash;
        string memory result = ok ? "GENUINE" : "COUNTERFEIT";
        m.verificationHistory.push(VerificationEvent(scannedCodeHash, verifier, location, result, block.timestamp));
        m.authenticityStatus = result;
        m.lastUpdatedAt = block.timestamp;

        emit MedicineVerified(medicineId, result, verifier);
    }

    function transferMedicine(
        string calldata medicineId,
        string calldata newCustodian,
        string calldata newRole
    ) external onlyOperator {
        Medicine storage m = _load(medicineId);
        require(!_is(m.status, "RECALLED"), "Action blocked on-chain: Asset is permanently recalled and frozen.");
        _req(newCustodian, "New custodian");
        _req(newRole, "New role");

        m.custodyHistory.push(CustodyEvent(m.currentCustodian, newCustodian, newRole, block.timestamp));
        m.currentCustodian = newCustodian;
        m.currentRole = newRole;
        m.lastUpdatedAt = block.timestamp;

        emit MedicineTransferred(medicineId, newCustodian, newRole);
    }

    function recallMedicine(
        string calldata medicineId,
        string calldata reason,
        string calldata recalledBy
    ) external onlyOperator {
        Medicine storage m = _load(medicineId);
        require(!_is(m.status, "RECALLED"), "Asset is already recalled.");
        _req(reason, "Recall reason");
        _req(recalledBy, "Recalled by");

        m.status = "RECALLED";
        m.authenticityStatus = "RECALLED";
        m.recallHistory.push(RecallEvent(reason, recalledBy, block.timestamp));
        for (uint256 i = 0; i < m.reports.length; i++) { m.reports[i].resolved = true; }
        m.custodyHistory.push(CustodyEvent(m.currentCustodian, m.manufacturer, "MANUFACTURER (RECALLED)", block.timestamp));
        m.currentCustodian = m.manufacturer;
        m.currentRole = "MANUFACTURER";
        m.lastUpdatedAt = block.timestamp;

        emit MedicineRecalled(medicineId, recalledBy);
    }

    /// The current custodian flags a suspected counterfeit. The manufacturer sees the open
    /// report and can then recall the batch (which marks all reports resolved).
    function reportCounterfeit(
        string calldata medicineId,
        string calldata reportedBy,
        string calldata location,
        string calldata details
    ) external onlyOperator {
        Medicine storage m = _load(medicineId);
        require(!_is(m.status, "RECALLED"), "Action blocked on-chain: Asset is already recalled.");
        _req(reportedBy, "Reporter");
        _req(details, "Report details");
        require(bytes(details).length <= 500, "Report details must be 500 characters or fewer");
        require(_is(reportedBy, m.currentCustodian), "Only the current custodian can report a counterfeit");

        m.reports.push(CounterfeitReport(reportedBy, location, details, false, block.timestamp));
        m.authenticityStatus = "SUSPECTED_COUNTERFEIT";
        m.lastUpdatedAt = block.timestamp;

        emit CounterfeitReported(medicineId, reportedBy, location);
    }

    function _is(string memory a, string memory b) private pure returns (bool) {
        return keccak256(bytes(a)) == keccak256(bytes(b));
    }

    // ---------- reads ----------
    function medicineCount() external view returns (uint256) { return ids.length; }

    function medicineIdAt(uint256 index) external view returns (string memory) { return ids[index]; }

    function readMedicine(string calldata medicineId) external view returns (Medicine memory) {
        return _load(medicineId);
    }
}
