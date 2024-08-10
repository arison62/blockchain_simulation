import express from "express";

import Blockchain from "./blockchain.js";

import crypto from "node:crypto";
const app = express();

const node_identifier = crypto.randomUUID();
const blockchain = new Blockchain();

app.use(express.json());

app.get("/blockchain", (req, res) => {
  res.status(200).json({
    chain: blockchain.chain,
    length: blockchain.chain.length,
  });
});

app.get("/mine", (req, res) => {
  blockchain.add_transaction({
    sender: "00",
    recipient: node_identifier,
    amount: 1,
  });

  // obtain the hash of the last block
  const last_block_hash = blockchain.hash_block(blockchain.last_block);

  // using the proof of work algorithm
  const nonce = blockchain.proof_work(blockchain.chain.length, last_block_hash);

  // add the block to the chain
  const block = blockchain.add_block(last_block_hash, nonce);
  res.status(200).json({
    message: "Block mined successfully",
    index: block.index,
    hash_of_previous_block: block.hash_previous_block,
    nonce: block.nonce,
    transactions: block.transactions,
  });
});

app.post("/transactions/new", (req, res) => {
  const body = req.body;

  if (!body.sender || !body.recipient || !body.amount) {
    return res.status(400).json({ message: "Invalid transaction" });
  }

  const index = blockchain.add_transaction(
    body.sender,
    body.recipient,
    body.amount
  );

  res.status(200).json({
    message: `Transaction added successfully. Transaction index: ${index}`,
  });
});

app.post("/nodes/add_nodes", (req, res) => {
  const body = req.body;
  const nodes = body.nodes;
  if (!nodes) return res.status(400).json({ message: "Missing nodes" });

  for (let node of nodes) {
    blockchain.add_node(node);
  }
  res.status(201).json({
    message: "Nodes added successfully",
    nodes: [...blockchain.nodes],
  });
});

app.get("/nodes/sync", async (req, res) => {
  const result = await blockchain.upadate_blockchain();

  res.status(200).json({
    message: result ? "Blockchain updated" : "Blockchain not updated",
    chain: blockchain.chain,
  });
});

const port = process.argv[2];

app.listen(port, () => {
  console.log(`Node #id {${node_identifier}} http://127.0.0.1:${port}`);
});
