import * as anchor from '@coral-xyz/anchor'
import { Program } from '@coral-xyz/anchor'
import { Keypair, PublicKey } from '@solana/web3.js'
import { startAnchor } from 'anchor-bankrun'
import { BankrunProvider } from 'anchor-bankrun'
import { Votingdapp } from '../target/types/votingdapp'
import { describe } from 'node:test'
import { isContext } from 'vm'

const IDL = require('/home/eleven/Rust/solana/Learning/voting-dapp/anchor/target/idl/votingdapp.json');
const votingAddress = new PublicKey("9ivJ8jJsyF29fFHgYE6WoFBDjtDGVp1vJqSgQnP7qPL8");

describe('Voting', () => {

  let Context;
  let provider: BankrunProvider;
  let votingProgram: Program<Votingdapp>;

  beforeAll(async () => {
    Context = await startAnchor("", [{ name: "votingdapp", programId: votingAddress }], []);
    provider = new BankrunProvider(Context);

    votingProgram = new Program<Votingdapp>(
      IDL,
      provider,
    );
  });

  it('Initialize Poll', async () => {
    // we will load the compiled program votingdapp here
    // keep the naming proper or you will run into issues
    Context = await startAnchor("", [{ name: "votingdapp", programId: votingAddress }], []);
    provider = new BankrunProvider(Context);

    votingProgram = new Program<Votingdapp>(
      IDL,
      provider,
    );

    await votingProgram.methods.initialize(
      
      new anchor.BN(1),
      "Best programming language?",
      new anchor.BN(Date.now()),
      new anchor.BN(Date.now() + 1000000),
      new anchor.BN(3),
    ).rpc();

    const [pollAddress] = PublicKey.findProgramAddressSync(
      [new anchor.BN(1).toArrayLike(Buffer, "le", 8)],
      votingAddress,
    )

    const poll = await votingProgram.account.poll.fetch(pollAddress);
    console.log("Poll account: ", poll);
    // Verify the poll was created correctly
    // console.log("Poll_start: ", poll.pollStart.toString());
    expect(poll.description).to.equal("Best programming language?");
    expect(poll.pollStart.toNumber()).toBeLessThan(poll.pollEnd.toNumber());
    expect(poll.candidateAmount.toNumber()).toBeGreaterThan(1);

  });

  it('Initialize Candidate', async () => {
    await votingProgram.methods.initializeCandidate(
      
      "Rust", 
      new anchor.BN(1),
      new anchor.BN(100),
    ).rpc();

    await votingProgram.methods.initializeCandidate(
      
      "C++", 
      new anchor.BN(1),
      new anchor.BN(100),
    ).rpc();
  
    await votingProgram.methods.initializeCandidate(
      
      "Python", 
      new anchor.BN(1),
      new anchor.BN(100),
    ).rpc();
  

    const [rustAddress] = PublicKey.findProgramAddressSync(
      [ Buffer.from("Rust"), new anchor.BN(1).toArrayLike(Buffer, "le", 8)],
      votingAddress,
    )

    const [CPlusPlusAddress] = PublicKey.findProgramAddressSync(
      [ Buffer.from("C++"), new anchor.BN(1).toArrayLike(Buffer, "le", 8)],
      votingAddress,
    )

    const [pythonAddress] = PublicKey.findProgramAddressSync(
      [ Buffer.from("Python"), new anchor.BN(1).toArrayLike(Buffer, "le", 8)],
      votingAddress,
    )
    const rustCandidate = await votingProgram.account.candidate.fetch(rustAddress);
    const cppCandidate = await votingProgram.account.candidate.fetch(CPlusPlusAddress);
    const pythonCandidate = await votingProgram.account.candidate.fetch(pythonAddress);

    console.log("Rust Candidate account: ", rustCandidate);
    console.log("C++ Candidate account: ", cppCandidate);
    console.log("Python Candidate account: ", pythonCandidate);

    // Verify the candidate was created correctly
    expect(rustCandidate.candidateName).to.equal("Rust");
    expect(rustCandidate.pollId.toNumber()).toEqual(1);
    expect(cppCandidate.candidateName).to.equal("C++");
    expect(cppCandidate.pollId.toNumber()).toEqual(1);
    expect(pythonCandidate.candidateName).to.equal("Python");
    expect(pythonCandidate.pollId.toNumber()).toEqual(1);



  });


  it('Initialize Vote', async () => {
    await votingProgram.methods.vote(
      "Rust",
      new anchor.BN(1),
    ).rpc();
  });


});
