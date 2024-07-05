use crate::{CommandResult, SmContext};

/// Request documentation for all or specified commands
#[poise::command(guild_only, prefix_command, aliases("h"))]
pub async fn help(ctx: SmContext<'_>, command: Option<String>) -> CommandResult {
    poise::builtins::help(
        ctx, 
        command.as_deref(), 
        poise::builtins::HelpConfiguration {
            extra_text_at_bottom: "\
Type \"-help <command>\" for more info on a command.
You can check out Smoothy's GitHub repository for more in depth info https://github.com/y0Phoenix/Smoothy/tree/main
            ",
            ..Default::default()
        }
    ).await?;
    Ok(())
}
