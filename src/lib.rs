use common::UserData;

pub mod commands;
pub mod common;
pub mod events;
pub mod executive;

pub type SmError = Box<dyn std::error::Error + Send + Sync>;
pub type SmContext<'a> = poise::Context<'a, UserData, SmError>;
pub type CommandResult = Result<(), SmError>;

pub const VC_DC_TIMEOUT_IN_SEC: u64 = 1800;
