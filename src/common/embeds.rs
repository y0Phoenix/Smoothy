use std::fmt::{Debug, Display};

use serenity::all::{Colour, CreateEmbed, CreateEmbedAuthor};

use crate::common::song::Song;

pub const LIST_QUEUE_COLOR: Colour = Colour::from_rgb(252, 3, 103);
pub const ADD_QUEUE_COLOR: Colour = Colour::from_rgb(252, 227, 3);
pub const SKIPPING_COLOR: Colour = Colour::from_rgb(3, 244, 252);
pub const NOW_PLAYING_COLOR: Colour = Colour::from_rgb(3, 132, 252);
pub const VOLUME_COLOR: Colour = Colour::from_rgb(252, 227, 3);
pub const LEAVING_COLOR: Colour = Colour::from_rgb(252, 3, 3);
pub const FAILED_COLOR: Colour = Colour::from_rgb(252, 3, 3);
pub const LOOPED_COLOR: Colour = Colour::PURPLE;
pub const SEEK_COLOR: Colour = Colour::from_rgb(3, 220, 3);
pub const PAUSE_COLOR: Colour = Colour::MEIBE_PINK;

pub const GET_SERVER_FAIL_MSG: &str =
    ":cry: Something went terribly wrong trying to obtain server info. Leaving vc, try again later";
pub const GET_SERVER_FAIL_DLT_TIME: u64 = 120000;

pub fn err_embed(err: impl ToString + Debug + Display) -> CreateEmbed {
    CreateEmbed::new()
        .color(FAILED_COLOR)
        .description(format!(":x: {}", err))
}

pub fn now_playing_embed(song: &Song) -> CreateEmbed {
    CreateEmbed::new()
        .color(NOW_PLAYING_COLOR)
        .author(CreateEmbedAuthor::new("Now Playing").icon_url("https://cdn.discordapp.com/attachments/778600026280558617/781024479623118878/ezgif.com-gif-maker_1.gif"))
        .description(format!("***[{}]({})***", song.title, song.url))
        .field("Requested by", format!("<@{}>", song.requested_by), true)
        .field("Duration", song.duration_formatted().to_string(), true)
        .thumbnail(song.thumbnail.clone())
}
