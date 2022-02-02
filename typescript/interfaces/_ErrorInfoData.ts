import { Message } from "discord.js";

export default interface _ErrorInfoData {
    song: {
        LiveStreamData: LiveStreamData;
        html5player: string;
        format: Partial<formatData>[];
        video_details: YouTubeVideo;
        related_videos: string[];
    }
    message: Partial<Message>;
}

interface LiveStreamData {
    isLive: boolean;
    dashManifestUrl: string | null;
    hlsManifestUrl: string | null;
}

interface formatData {
    itag: number;
    mimeType: string;
    bitrate: number;
    width: number;
    height: number;
    lastModified: string;
    contentLength: string;
    quality: string;
    fps: number;
    qualityLabel: string;
    projectionType: string;
    averageBitrate: number;
    audioQuality: string;
    approxDurationMs: string;
    audioSampleRate: string;
    audioChannels: number;
    url: string;
    signatureCipher: string;
    cipher: string;
    loudnessDb: number;
    targetDurationSec: number;
}

declare class YouTubeVideo {
    /**
     * YouTube Video ID
     */
    id?: string;
    /**
     * YouTube video url
     */
    url: string;
    /**
     * YouTube Class type. == "video"
     */
    type: 'video' | 'playlist' | 'channel';
    /**
     * YouTube Video title
     */
    title?: string;
    /**
     * YouTube Video description.
     */
    description?: string;
    /**
     * YouTube Video Duration Formatted
     */
    durationRaw: string;
    /**
     * YouTube Video Duration in seconds
     */
    durationInSec: number;
    /**
     * YouTube Video Uploaded Date
     */
    uploadedAt?: string;
    /**
     * YouTube Views
     */
    views: number;
    /**
     * YouTube Thumbnail Data
     */
    thumbnails: YouTubeThumbnail[];
    /**
     * YouTube Video's uploader Channel Data
     */
    channel?: any;
    /**
     * YouTube Video's likes
     */
    likes: number;
    /**
     * YouTube Video live status
     */
    live: boolean;
    /**
     * YouTube Video private status
     */
    private: boolean;
    /**
     * YouTube Video tags
     */
    tags: string[];
    /**
     * `true` if the video has been identified by the YouTube community as inappropriate or offensive to some audiences and viewer discretion is advised
     */
    discretionAdvised?: boolean;
    /**
     * Gives info about music content in that video.
     */
    music?: any[];
    /**
     * Constructor for YouTube Video Class
     * @param data JSON parsed data.
     */
    constructor(data: any);
    /**
     * Converts class to title name of video.
     * @returns Title name
     */
    toString(): string;
    /**
     * Converts class to JSON data
     * @returns JSON data.
     */
    toJSON(): any;
}

declare class YouTubeThumbnail {
    url: string;
    width: number;
    height: number;
    constructor(data: any);
    toJSON(): {
        url: string;
        width: number;
        height: number;
    };
}