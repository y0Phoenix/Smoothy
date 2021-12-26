export interface Playlist {
    id: string;
    url: string;
    title: string;
    estimatedItemCount: number;
    views: number;
    thumbnails: Image[];
    bestThumbnail: Image;
    lastUpdated: string;
    description: string | null;
    visibility: 'unlisted' | 'everyone';
    author: {
      name: string;
      url: string;
      avatars: Image[];
      bestAvatar: Image;
      channelID: string;
    };
    items: Partial<Item>[];
    continuation: Continuation | null;
};

interface Image {
    url: string | null;
    width: number;
    height: number;
};

export interface Item {
    title: string;
    index: number;
    id: string;
    shortUrl: string;
    url: string;
    author: {
      name: string;
      url: string;
      channelID: string;
    };
    thumbnails: Image[];
    bestThumbnail: Image;
    isLive: boolean;
    duration: string | null;
    durationSec: number | null;
};

interface Continuation {};