const { Gateway, Wallets } = require('fabric-network');
const path = require('path');
const fs = require('fs');

async function addEvidence(evidenceID) {
    try {
        // Load the network configuration
        const ccpPath = path.resolve(__dirname, 'connection-evidencechannel.json');
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        // Load the wallet
        const walletPath = path.join(__dirname, 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);

        // Check if the admin is enrolled
        const identity = await wallet.get('Admin');
        if (!identity) {
            console.log('❌ Admin identity not found. Please enroll the admin first.');
            return;
        }

        // Create a new gateway connection
        const gateway = new Gateway();
        await gateway.connect(ccp, {
            wallet,
            identity: 'Admin',
            discovery: { enabled: true, asLocalhost: true },
        });

        // Get the network and contract
        const network = await gateway.getNetwork('evidencechannel');
        const contract = network.getContract('evidence_tracker');

        // Submit transaction to add evidence by calling AddEvidence
        await contract.submitTransaction('AddEvidence', evidenceID);
        console.log(`✅ Evidence with ID '${evidenceID}' added successfully.`);

        // Disconnect from the gateway
        await gateway.disconnect();
    } catch (error) {
        console.error(`❌ Failed to add evidence: ${error}`);
    }
}

// Example: Add a new evidence record
addEvidence('EV001');

