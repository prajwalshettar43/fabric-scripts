const { Gateway, Wallets } = require('fabric-network');
const path = require('path');
const fs = require('fs');

async function main() {
    try {
        // Load the network configuration
        const ccpPath = path.resolve(__dirname, '..', 'fabric-samples', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        // Create a new file system-based wallet
        const walletPath = path.join(__dirname, 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);

        // Check if Admin user exists
        const identity = await wallet.get('Admin');
        if (!identity) {
            console.log('Admin identity not found in the wallet. Run the enrollment script first.');
            return;
        }

        // Connect to the Fabric gateway
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: 'Admin', discovery: { enabled: true, asLocalhost: true } });

        // Get the network channel
        const network = await gateway.getNetwork('evidencechannel'); // Change to your channel name
        const contract = network.getContract('evidence_tracker'); // Change to your chaincode name

        // Generate a sample evidence hash
        const evidenceHash = 'evidence_hash_456';

        console.log(`Submitting transaction to add evidence: ${evidenceHash}`);

        // Submit the transaction to the blockchain
        await contract.submitTransaction('AddEvidence', evidenceHash);

        console.log(`Transaction successful! Evidence ${evidenceHash} has been recorded.`);

        // Disconnect from the gateway
        await gateway.disconnect();
    } catch (error) {
        console.error(`Error: ${error}`);
    }
}

main();

