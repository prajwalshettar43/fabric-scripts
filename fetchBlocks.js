const { Gateway, Wallets } = require('fabric-network');
const path = require('path');
const fs = require('fs');
const protos = require('fabric-protos'); // Import Fabric Protobufs

async function main() {
    try {
        // Load connection profile
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

        // Connect to Fabric gateway
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: 'Admin', discovery: { enabled: true, asLocalhost: true } });

        // Get the network channel
        const network = await gateway.getNetwork('evidencechannel'); // Updated channel name
        const contract = network.getContract('qscc'); // Query System Chaincode

        // Get the latest block number
        const result = await contract.evaluateTransaction('GetChainInfo', 'evidencechannel');
        const chainInfo = protos.common.BlockchainInfo.decode(Buffer.from(result)); // Convert to Buffer
        const blockHeight = parseInt(chainInfo.height, 10);

        console.log(`Blockchain height: ${blockHeight}`);

        // Iterate over all blocks
        for (let i = 0; i < blockHeight; i++) {
            try {
                const blockData = await contract.evaluateTransaction('GetBlockByNumber', 'evidencechannel', i.toString());
                const block = protos.common.Block.decode(Buffer.from(blockData)); // Convert to Buffer
                console.log(`Block ${i}:`, JSON.stringify(block, null, 2));
            } catch (err) {
                console.error(`Error fetching block ${i}: ${err.message}`);
            }
        }

        // Disconnect from Fabric
        await gateway.disconnect();
    } catch (error) {
        console.error(`Error: ${error}`);
    }
}

main();

