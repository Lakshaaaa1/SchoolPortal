import { useState } from "react";
import { Play } from "lucide-react";
import type { Announcement } from "@shared/schema";

function extractYouTubeVideoId(url: string): string | null {
  if (!url) return null;
  
  try {
    // Handle YouTube URLs: watch URLs, shorts, and youtu.be links
    const youtubeRegex = /(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(youtubeRegex);
    return match ? match[1] : null;
  } catch (error) {
    console.error('Error parsing YouTube URL:', error);
    return null;
  }
}

function formatTimeAgo(date: Date | string) {
  const now = new Date();
  const parsedDate = typeof date === 'string' ? new Date(date) : date;
  const diffHours = Math.floor((now.getTime() - parsedDate.getTime()) / (1000 * 60 * 60));
  
  if (diffHours < 1) return "Just now";
  if (diffHours < 24) return `${diffHours} hours ago`;
  return `${Math.floor(diffHours / 24)} days ago`;
}

export default function AnnouncementCard({ announcement }: { announcement: Announcement }) {
  const [showVideo, setShowVideo] = useState(false);
  const videoId = extractYouTubeVideoId(announcement.video_url || "");
  const hasValidVideo = !!videoId;

  return (
    <div key={announcement.id} className="border-l-4 border-primary pl-3">
      {/* Video Section - Only if valid YouTube URL exists */}
      {hasValidVideo && !showVideo && (
        <div 
          className="relative mb-3 cursor-pointer group rounded-lg overflow-hidden bg-black"
          onClick={() => setShowVideo(true)}
          data-testid={`thumbnail-${announcement.id}`}
        >
          <img
            src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
            alt="Video thumbnail"
            className="w-full h-40 object-cover group-hover:opacity-75 transition-opacity"
            onError={(e) => {
              // Hide thumbnail if image fails to load (invalid video ID)
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          {/* Play Icon Overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/50 transition-colors">
            <Play className="h-12 w-12 text-white fill-white" />
          </div>
        </div>
      )}

      {/* Video Player - Replace thumbnail when clicked */}
      {hasValidVideo && showVideo && (
        <div className="mb-3 rounded-lg overflow-hidden bg-black aspect-video">
          <iframe
            width="100%"
            height="100%"
            src={`https://www.youtube.com/embed/${videoId}?autoplay=0`}
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="border-0"
            data-testid={`video-player-${announcement.id}`}
          />
        </div>
      )}

      {/* Image Section - Display if image_url exists and no video */}
      {announcement.image_url && !hasValidVideo && (
        <img
          src={announcement.image_url}
          alt="Announcement"
          className="w-full h-40 object-cover rounded-lg mb-3"
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
      )}

      {/* Text Content */}
      <p className="font-medium text-sm" data-testid={`title-${announcement.id}`}>
        {announcement.title || announcement.message}
      </p>
      <p className="text-xs text-gray-600 line-clamp-2 mt-1" data-testid={`description-${announcement.id}`}>
        {announcement.description || announcement.message}
      </p>
      <p className="text-xs text-gray-400 mt-1" data-testid={`metadata-${announcement.id}`}>
        {announcement.department} • {formatTimeAgo(announcement.createdAt || new Date())}
      </p>
    </div>
  );
}
