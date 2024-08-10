import { sha256 } from "js-sha256";

class Blockchain {
  constructor() {
    this.nodes = new Set();
    this.difficulty_target = "0000";

    this.chain = [];
    this.current_transactions = [];

    const genesis_block = "genesis_block";

    const genesis_block_hash = sha256.hex(JSON.stringify(genesis_block));

    this.add_block(
      genesis_block_hash,
      this.proof_work(0, genesis_block, genesis_block_hash, [])
    );
  }

  hash_block(block) {
    const block_encoded = JSON.stringify(block);
    return sha256.hex(block_encoded);
  }

  valid_proof(index, hash_previous_block, nonce, transactions) {
    const trans_encoded = JSON.stringify(transactions);
    const content = `${index}${hash_previous_block}${trans_encoded}${nonce}`;
    const hash_content = sha256.hex(content);
    return hash_content.startsWith(this.difficulty_target);
  }

  proof_work(index, hash_previous_block) {
    let nonce = 0;

    while (
      !this.valid_proof(
        index,
        hash_previous_block,
        nonce,
        this.current_transactions
      )
    ) {
      nonce += 1;
    }

    return nonce;
  }

  add_block(hash_previous_block, nonce) {
    const block = {
      index: this.chain.length,
      hash_previous_block: hash_previous_block,
      timestamp: new Date().getTime(),
      transactions: this.current_transactions,
      nonce: nonce,
    };

    this.chain.push(block);
    this.current_transactions = [];
    return block;
  }

  add_transaction(sender, recipient, amount) {
    this.current_transactions.push({
      sender: sender,
      recipient: recipient,
      amount: amount,
    });

    return this.last_block["index"] + 1;
  }

  get last_block() {
    return this.chain[this.chain.length - 1];
  }

  add_node(address) {
    const parse_url = new URL(address);
    this.nodes.add(parse_url.host);
    console.log(parse_url.host);
  }

  valid_chain(chain) {
    let last_block = chain[0];
    let current_index = 1;

    while (current_index < chain.length) {
      let block = chain[current_index];

      if (block.hash_previous_block != this.hash_block(last_block)) {
        return false;
      }
      
      if (
        !this.valid_proof(
          current_index,
          block.hash_previous_block,
          block.nonce,
          block.transactions
        )
      ){
        return false;
      }
      last_block = block;
      current_index++;
    }
    
    return true;
  }

  async upadate_blockchain(){

    const other_nodes = this.nodes;
    let  new_chain = undefined;
    let  max_length = this.chain.length;

    for(let node of other_nodes){
      const response = await fetch(`http://${node}/blockchain`);
      const data = await response.json();
      const length = data.length;
      const chain = data.chain;
     
      if(length > max_length && this.valid_chain(chain)){
        max_length = length;
        new_chain = chain;
      }
    }

    if(new_chain){
      this.chain = new_chain;
      return true;
    }
    return false;
  }

}

export default Blockchain;
