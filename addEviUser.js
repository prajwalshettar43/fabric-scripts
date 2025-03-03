const { Gateway, Wallets } = require('fabric-network');
const path = require('path');
const fs = require('fs');

async function main() {
    const ccpPath = path.resolve(__dirname, 'connection-org1.json');
    const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

    const walletPath = path.join(process.cwd(), 'wallet');
    const wallet = await Wallets.newFileSystemWallet(walletPath);

    const identity = await wallet.get('User1');
    if (!identity) {
        console.log('User1 not found in the wallet. Run the enrollment script first.');
        return;
    }

    // Define paths correctly
    const tlsCertPath = '/home/slayer/fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/tlsca/tlsca.org1.example.com-cert.pem';
    const keyDirectoryPath = '/home/slayer/fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/users/User1@org1.example.com/msp/keystore';
    
    // Get the private key filename dynamically
    const keyFileName = fs.readdirSync(keyDirectoryPath).find(file => file.endsWith('_sk'));
    if (!keyFileName) {
        console.error('Private key file not found in keystore directory.');
        return;
    }
    const keyPath = path.join(keyDirectoryPath, keyFileName);

    const gateway = new Gateway();
    await gateway.connect(ccp, {
        wallet,
        identity: 'User1',
        discovery: { enabled: true, asLocalhost: true },
        clientTlsIdentity: 'User1',
        eventHandlerOptions: {
            commitTimeout: 150,  // Increase timeout
        }
    });
    
    

    const network = await gateway.getNetwork('evidencechannel');
    const contract = network.getContract('evidence_tracker'); // Change 'evidencecontract' to your chaincode name

    console.log('Submitting AddEvidence transaction...');
    await contract.submitTransaction('AddEvidence', 'hash123');
    console.log('Transaction submitted.');

    gateway.disconnect();
}

main();
