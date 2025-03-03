const { exec } = require("child_process");

const cmd = `peer chaincode invoke -o orderer.example.com:7050 \
    --tls true --cafile $ORDERER_CA \
    -C evidencechannel -n evidence_tracker \
    --peerAddresses localhost:7051 \
    --tlsRootCertFiles $PEER0_ORG1_CA \
    -c '{"Args":["AddEvidence", "evidence_hash_123"]}'`;

exec(cmd, (error, stdout, stderr) => {
    if (error) {
        console.error(`Error: ${error.message}`);
        return;
    }
    if (stderr) {
        console.error(`Stderr: ${stderr}`);
        return;
    }
    console.log(`Success: ${stdout}`);
});
