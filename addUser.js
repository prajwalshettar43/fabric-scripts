const { Wallets } = require('fabric-network');
const fs = require('fs');
const path = require('path');

async function main() {
    const wallet = await Wallets.newFileSystemWallet('./wallet');

    // Load User1's certificate and private key
    const certPath = "/home/slayer/fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/users/User1@org1.example.com/msp/signcerts/cert.pem";
    const keyPath = "/home/slayer/fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/users/User1@org1.example.com/msp/keystore/4f2875b2c9e5c5dd2aab89efade2729e8398308b849d45c50bbba0ffc3ad23d8_sk";

    const cert = fs.readFileSync(certPath).toString();
    const key = fs.readFileSync(keyPath).toString();

    // Add User1's identity to the wallet
    const identity = {
        credentials: { certificate: cert, privateKey: key },
        mspId: 'Org1MSP',
        type: 'X.509',
    };
    await wallet.put('User1', identity);
    console.log('User1 identity added to wallet');
}

main();
