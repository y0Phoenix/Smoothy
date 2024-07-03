use std::fmt::{Debug, Display};

use serenity::all::{Colour, CreateEmbed, CreateEmbedAuthor};

use super::song::TrackMetaData;

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

pub const GET_SERVER_FAIL_MSG: &str = ":cry: Something went terribly wrong trying to obtain server info. Leaving vc, try again later";
pub const GET_SERVER_FAIL_DLT_TIME: u64 = 120000;


pub fn err_embed(err: impl ToString + Debug + Display) -> CreateEmbed {
    CreateEmbed::new()
        .color(FAILED_COLOR)
        .description(format!(":x: {}", err))
}

pub fn now_playing_embed(meta_data: &TrackMetaData) -> CreateEmbed {
    CreateEmbed::new()
        .color(NOW_PLAYING_COLOR)
        .author(CreateEmbedAuthor::new("Now Playing").icon_url("https://cdn.discordapp.com/attachments/778600026280558617/781024479623118878/ezgif.com-gif-maker_1.gif"))
        .description(format!("***[{}]({})***", meta_data.song.title, meta_data.song.url))
        .field("Requested by", format!("<@{}>", meta_data.song.requested_by), true)
        .field("Duration", meta_data.song.duration_formatted().to_string(), true)
        .thumbnail(meta_data.song.thumbnail.clone())
}