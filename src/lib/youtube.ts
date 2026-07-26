import { env } from "process";

export interface YoutubeShort {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  viewCount: number;
  duration: string;
}

const YOUTUBE_API_KEY = env.YOUTUBE_API_KEY;
const YOUTUBE_CHANNEL_ID = env.YOUTUBE_CHANNEL_ID;
const BASE_URL = "https://www.googleapis.com/youtube/v3";

/**
 * Helper to parse ISO 8601 duration (e.g., PT58S, PT1M12S) to seconds.
 */
function parseDurationToSeconds(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;

  const hours = parseInt(match[1] || "0", 10);
  const minutes = parseInt(match[2] || "0", 10);
  const seconds = parseInt(match[3] || "0", 10);

  return hours * 3600 + minutes * 60 + seconds;
}

export async function getYoutubeShorts(): Promise<YoutubeShort[]> {
  if (!YOUTUBE_API_KEY || !YOUTUBE_CHANNEL_ID) {
    console.warn("YouTube API keys are missing.");
    return [];
  }

  try {
    // 1. Get the uploads playlist ID for the channel
    const channelsRes = await fetch(
      `${BASE_URL}/channels?part=contentDetails&id=${YOUTUBE_CHANNEL_ID}&key=${YOUTUBE_API_KEY}`,
      { next: { revalidate: 60 } }
    );
    const channelsData = await channelsRes.json();
    if (!channelsData.items || channelsData.items.length === 0) return [];

    const uploadsPlaylistId = channelsData.items[0].contentDetails.relatedPlaylists.uploads;

    // 2. Fetch the latest 50 videos from the uploads playlist
    const playlistRes = await fetch(
      `${BASE_URL}/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=50&key=${YOUTUBE_API_KEY}`,
      { next: { revalidate: 60 } }
    );
    const playlistData = await playlistRes.json();
    if (!playlistData.items || playlistData.items.length === 0) return [];

    const videoIds = playlistData.items.map((item: { snippet: { resourceId: { videoId: string } } }) => item.snippet.resourceId.videoId).join(',');

    // 3. Fetch video details to get duration and view count
    const videosRes = await fetch(
      `${BASE_URL}/videos?part=contentDetails,statistics,snippet&id=${videoIds}&key=${YOUTUBE_API_KEY}`,
      { next: { revalidate: 60 } }
    );
    const videosData = await videosRes.json();
    if (!videosData.items) return [];

    // 4. Filter and map to Shorts
    const shorts: YoutubeShort[] = videosData.items
      .filter((video: { contentDetails: { duration: string }; snippet: { title: string; description: string } }) => {
        const durationSeconds = parseDurationToSeconds(video.contentDetails.duration);
        const title = video.snippet.title.toLowerCase();
        const description = video.snippet.description.toLowerCase();

        // A video is a Short if its duration is under 60 seconds OR it contains #shorts in title/desc
        return durationSeconds <= 60 || title.includes('#shorts') || description.includes('#shorts');
      })
      .map((video: { id: string; snippet: { title: string; description: string; thumbnails: Record<string, { url: string }> }; statistics: { viewCount: string }; contentDetails: { duration: string } }): YoutubeShort => {
        const thumbnails = video.snippet.thumbnails;
        // Prefer maxres, then high, then medium
        const thumbnailUrl = thumbnails.maxres?.url || thumbnails.high?.url || thumbnails.medium?.url || thumbnails.default?.url;

        return {
          id: video.id,
          title: video.snippet.title,
          description: video.snippet.description,
          thumbnailUrl,
          viewCount: parseInt(video.statistics.viewCount || "0", 10),
          duration: video.contentDetails.duration,
        };
      });

    // 5. Sort descending by view count
    shorts.sort((a, b) => b.viewCount - a.viewCount);

    return shorts;
  } catch (error) {
    console.error("Error fetching YouTube Shorts:", error);
    return [];
  }
}
