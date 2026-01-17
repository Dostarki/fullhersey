use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    program::{invoke, invoke_signed},
    program_error::ProgramError,
    pubkey::Pubkey,
    system_instruction,
};
use borsh::{BorshDeserialize, BorshSerialize};

entrypoint!(process_instruction);

#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub enum VaultInstruction {
    /// Deposit SOL into the vault
    /// Accounts expected:
    /// 0. `[signer]` The user depositing
    /// 1. `[writable]` The vault PDA
    /// 2. `[]` System Program
    Deposit { amount: u64 },

    /// Withdraw SOL from the vault
    /// Accounts expected:
    /// 0. `[signer]` The user withdrawing
    /// 1. `[writable]` The vault PDA
    /// 2. `[]` System Program
    Withdraw { amount: u64 },
}

pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    let instruction = VaultInstruction::try_from_slice(instruction_data)
        .map_err(|_| ProgramError::InvalidInstructionData)?;

    match instruction {
        VaultInstruction::Deposit { amount } => {
            msg!("Processing Deposit: {} lamports", amount);
            process_deposit(program_id, accounts, amount)
        }
        VaultInstruction::Withdraw { amount } => {
            msg!("Processing Withdraw: {} lamports", amount);
            process_withdraw(program_id, accounts, amount)
        }
    }
}

fn process_deposit(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    amount: u64,
) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();
    let user_account = next_account_info(account_info_iter)?;
    let vault_pda = next_account_info(account_info_iter)?;
    let system_program = next_account_info(account_info_iter)?;

    if !user_account.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }

    let (pda, _bump_seed) = Pubkey::find_program_address(&[b"vault", user_account.key.as_ref()], program_id);
    if pda != *vault_pda.key {
        return Err(ProgramError::InvalidSeeds);
    }

    let ix = system_instruction::transfer(
        user_account.key,
        vault_pda.key,
        amount,
    );

    invoke(
        &ix,
        &[user_account.clone(), vault_pda.clone(), system_program.clone()],
    )?;

    msg!("Deposit successful");
    Ok(())
}

fn process_withdraw(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    amount: u64,
) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();
    let user_account = next_account_info(account_info_iter)?;
    let vault_pda = next_account_info(account_info_iter)?;
    let system_program = next_account_info(account_info_iter)?;

    if !user_account.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }

    let (pda, bump_seed) = Pubkey::find_program_address(&[b"vault", user_account.key.as_ref()], program_id);
    if pda != *vault_pda.key {
        return Err(ProgramError::InvalidSeeds);
    }

    // Check balance
    if **vault_pda.lamports.borrow() < amount {
        return Err(ProgramError::InsufficientFunds);
    }

    let ix = system_instruction::transfer(
        vault_pda.key,
        user_account.key,
        amount,
    );

    invoke_signed(
        &ix,
        &[vault_pda.clone(), user_account.clone(), system_program.clone()],
        &[&[b"vault", user_account.key.as_ref(), &[bump_seed]]],
    )?;

    msg!("Withdraw successful");
    Ok(())
}
