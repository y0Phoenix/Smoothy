use std::fmt::{Debug, Display};

use serenity::all::{Colour, CreateEmbed};

pub const LIST_QUEUE_COLOR: Colour = Colour::from_rgb(252, 3, 103);
pub const ADD_QUEUE_COLOR: Colour = Colour::from_rgb(252, 227, 3);
pub const SKIPPING_COLOR: Colour = Colour::from_rgb(3, 244, 252);
pub const NOW_PLAYING_COLOR: Colour = Colour::from_rgb(3, 132, 252);
pub const VOLUME_COLOR: Colour = Colour::from_rgb(252, 227, 3);
pub const LEAVING_COLOR: Colour = Colour::from_rgb(252, 3, 3);
pub const FAILED_COLOR: Colour = Colour::from_rgb(252, 3, 3);
pub const LOOPED_COLOR: Colour = Colour::PURPLE;

pub fn err_embed(err: impl ToString + Debug + Display) -> CreateEmbed {
    CreateEmbed::new()
        .color(FAILED_COLOR)
        .description(format!(":x: {}", err))
}