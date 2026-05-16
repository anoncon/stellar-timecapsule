#![no_std]

use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, Address, Env, String};

#[contracttype]
#[derive(Clone)]
pub struct Capsule {
    pub creator: Address,
    pub recipient: Address,
    pub asset_code: String,
    pub amount: i128,
    pub unlock_at: u64,
    pub opened: bool,
    pub canceled: bool,
    pub title: String,
    pub message: String,
}

#[contracttype]
pub enum DataKey {
    NextId,
    Capsule(u64),
}

#[contract]
pub struct StellarTimeCapsule;

#[contractimpl]
impl StellarTimeCapsule {
    pub fn create_capsule(
        env: Env,
        creator: Address,
        recipient: Address,
        asset_code: String,
        amount: i128,
        unlock_at: u64,
        title: String,
        message: String,
    ) -> u64 {
        creator.require_auth();
        if amount <= 0 {
            panic!("amount must be positive");
        }
        if unlock_at <= env.ledger().timestamp() {
            panic!("unlock time must be in the future");
        }

        let next_id = env.storage().persistent().get(&DataKey::NextId).unwrap_or(0_u64) + 1;
        let capsule = Capsule {
            creator: creator.clone(),
            recipient: recipient.clone(),
            asset_code: asset_code.clone(),
            amount,
            unlock_at,
            opened: false,
            canceled: false,
            title: title.clone(),
            message: message.clone(),
        };

        env.storage().persistent().set(&DataKey::NextId, &next_id);
        env.storage().persistent().set(&DataKey::Capsule(next_id), &capsule);
        env.events().publish((symbol_short!("capsule"), symbol_short!("create")), next_id);
        next_id
    }

    pub fn open_capsule(env: Env, id: u64, recipient: Address) {
        recipient.require_auth();
        let mut capsule = read_capsule(&env, id);
        if capsule.recipient != recipient {
            panic!("recipient mismatch");
        }
        if capsule.canceled {
            panic!("capsule canceled");
        }
        if capsule.opened {
            panic!("capsule already opened");
        }
        if env.ledger().timestamp() < capsule.unlock_at {
            panic!("capsule still sealed");
        }

        capsule.opened = true;
        env.storage().persistent().set(&DataKey::Capsule(id), &capsule);
        env.events().publish((symbol_short!("capsule"), symbol_short!("open")), id);
    }

    pub fn cancel_capsule(env: Env, id: u64, creator: Address) {
        creator.require_auth();
        let mut capsule = read_capsule(&env, id);
        if capsule.creator != creator {
            panic!("creator mismatch");
        }
        if capsule.opened {
            panic!("opened capsules cannot be canceled");
        }
        if capsule.canceled {
            panic!("capsule already canceled");
        }

        capsule.canceled = true;
        env.storage().persistent().set(&DataKey::Capsule(id), &capsule);
        env.events().publish((symbol_short!("capsule"), symbol_short!("cancel")), id);
    }

    pub fn get_capsule(env: Env, id: u64) -> Capsule {
        read_capsule(&env, id)
    }
}

fn read_capsule(env: &Env, id: u64) -> Capsule {
    env.storage()
        .persistent()
        .get(&DataKey::Capsule(id))
        .unwrap_or_else(|| panic!("capsule not found"))
}
