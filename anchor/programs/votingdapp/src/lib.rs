use anchor_lang::prelude::*;

declare_id!("9ivJ8jJsyF29fFHgYE6WoFBDjtDGVp1vJqSgQnP7qPL8");

#[program]
pub mod votingdapp {
    use super::*;

    pub fn initialize(
        _ctx: Context<InitializePoll>,
        poll_id: u64,
        descirption: String,
        poll_start: u64,
        poll_end: u64,
        candidate_amount: u64,
    ) -> Result<()> {
        let poll = &mut _ctx.accounts.poll;
        poll.poll_id = poll_id;
        poll.poll_start = poll_start;
        poll.poll_end = poll_end;
        poll.description = descirption;
        poll.candidate_amount = candidate_amount;
        Ok(())
    }

    pub fn initialize_candidate(
        _ctx: Context<InitializeCandidate>,
        candidate_name: String,
        poll_id: u64,
        candidate_vote: u64,
    ) -> Result<()> {
        let candidate = &mut _ctx.accounts.candidate;
        let poll = &mut _ctx.accounts.poll;
        poll.candidate_amount += 1;
        candidate.candidate_name = candidate_name;
        candidate.poll_id = poll_id;
        candidate.candidate_vote = candidate_vote;

        Ok(())
    }

    pub fn vote(_ctx: Context<InitializeVote>, candidate_name: String, poll_id: u64) -> Result<()> {

        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(poll_id: u64)]
pub struct InitializePoll<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(
        init,
        payer = signer,
        space = 8 + Poll::INIT_SPACE,
        seeds = [poll_id.to_le_bytes().as_ref()],
        bump
    )]
    pub poll: Account<'info, Poll>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(candidate_name: String, poll_id: u64)]

pub struct InitializeCandidate<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(
        seeds = [poll_id.to_le_bytes().as_ref()],
        bump
    )]
    pub poll: Account<'info, Poll>,

    #[account(
        init,
        payer = signer,
        space = 8 + Candidate::INIT_SPACE,
        seeds = [candidate_name.as_bytes(), poll_id.to_le_bytes().as_ref()],
        bump
    )]
    pub candidate: Account<'info, Candidate>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(candidate_name: String, poll_id: u64)]
pub struct InitializeVote<'info> {

    pub signer: Signer<'info>,

    #[account(
        seeds = [ poll_id.to_le_bytes().as_ref()],
        bump
    )]
    pub poll: Account<'info, Poll>,
    
    #[account(
        seeds = [signer.key().as_ref(), poll_id.to_le_bytes().as_ref()],
        bump
    )]
    pub vote: Account<'info, Vote>,
}

#[account]
#[derive(InitSpace)]
pub struct Poll {
    pub poll_id: u64,
    #[max_len(280)]
    pub description: String,
    pub poll_start: u64,
    pub poll_end: u64,
    pub candidate_amount: u64,
}

#[account]
#[derive(InitSpace)]
pub struct Candidate {
    pub poll_id: u64,
    #[max_len(32)]
    pub candidate_name: String,
    pub candidate_vote: u64,
}

#[account]
#[derive(InitSpace)]
pub struct Vote {
    pub voter: Pubkey,
    pub poll_id: u64,
    #[max_len(32)]
    pub candidate_name: String,
}
