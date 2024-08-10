### Blockchain simulation
Implementing of blockchain operations with **nodejs** based on *proof of work* algorithm

##### Steps
1. create blockchain class
2. add transactions in a block
3. obtaining the nonce
4. add block to block chain
5. create a rest api to interact with the blockchain
    * start blockchain nodes for create blockchain network

#####  Test

`git clone https://github.com/arison62/blockchain_simulation.git`

`npm i express`

###### Start at least  3 nodes instance on diffents port
`node main.js 5000`
`node main.js 5001`
`...`

###### Interact with blockchain

`GET http://localhost:{port}/blockchain` : get blockchain
`GET http://localhost:{port}/mine` : add a block to blockchain
`POST data = JSON{sender, recipient, amount} http://localhost:{port}/transactions/new` : add transaction to a block
`POST data = JSON{[address, ...]} http://localhost:{port}/nodes/add_nodes`: add nodes
`GET http://localhost:{port}/nodes/sync` : synchronise blockchain



