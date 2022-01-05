import { YouTubeVideo } from "play-dl";

export default interface InfoData {
    LiveStreamData: LiveStreamData;
    html5player: string;
    format: Partial<formatData>[];
    video_details: YouTubeVideo;
    related_videos: string[];
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