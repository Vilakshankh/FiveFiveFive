'use client';

import { useEffect, useRef, useState } from 'react';
import type Hls from 'hls.js';

interface HlsPlayerProps {
  src: string;
  poster?: string;
  className?: string;
  onBuffering?: (isBuffering: boolean) => void;
}

/**
 * HLS Video Player Component
 *
 * Supports both native HLS playback (Safari/iOS) and hls.js for other browsers.
 * Provides adaptive bitrate streaming for better performance across network conditions.
 *
 * Usage:
 * ```tsx
 * <HlsPlayer
 *   src="https://your-blob-url/master.m3u8"
 *   poster="https://your-blob-url/poster.jpg"
 *   onBuffering={(buffering) => console.log('Buffering:', buffering)}
 * />
 * ```
 *
 * To create HLS content from MP4:
 * ```bash
 * ffmpeg -i video.mp4 \
 *   -c copy -movflags +faststart \
 *   -hls_time 6 -hls_playlist_type vod -hls_list_size 0 \
 *   -hls_segment_type fmp4 \
 *   -master_pl_name master.m3u8 \
 *   output.m3u8
 * ```
 */
export default function HlsPlayer({
  src,
  poster,
  className = '',
  onBuffering
}: HlsPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [isBuffering, setIsBuffering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Check if browser supports native HLS (Safari/iOS)
    const canPlayNative = video.canPlayType('application/vnd.apple.mpegurl');

    if (canPlayNative) {
      // Native HLS support
      video.src = src;
      return;
    }

    // Load hls.js for browsers without native HLS support
    (async () => {
      try {
        const Hls = (await import('hls.js')).default;

        if (Hls.isSupported()) {
          const hls = new Hls({
            enableWorker: true,
            lowLatencyMode: false,
            backBufferLength: 90,
            maxBufferSize: 60 * 1000 * 1000, // 60MB
            maxBufferLength: 30, // 30 seconds
            maxMaxBufferLength: 60, // Max 60 seconds
          });

          hls.loadSource(src);
          hls.attachMedia(video);

          // Error handling
          hls.on(Hls.Events.ERROR, (_event, data) => {
            if (data.fatal) {
              switch (data.type) {
                case Hls.ErrorTypes.NETWORK_ERROR:
                  console.error('Network error, trying to recover...');
                  hls.startLoad();
                  break;
                case Hls.ErrorTypes.MEDIA_ERROR:
                  console.error('Media error, trying to recover...');
                  hls.recoverMediaError();
                  break;
                default:
                  setError('Fatal error loading video');
                  hls.destroy();
                  break;
              }
            }
          });

          hlsRef.current = hls;
        } else {
          // Fallback to direct MP4 URL
          console.warn('HLS not supported, falling back to direct MP4');
          video.src = src;
        }
      } catch (err) {
        console.error('Error loading hls.js:', err);
        setError('Failed to load video player');
      }
    })();

    // Cleanup
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [src]);

  // Buffer monitoring
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleWaiting = () => {
      setIsBuffering(true);
      onBuffering?.(true);
    };

    const handlePlaying = () => {
      setIsBuffering(false);
      onBuffering?.(false);
    };

    const handleCanPlay = () => {
      setIsBuffering(false);
      onBuffering?.(false);
    };

    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('playing', handlePlaying);
    video.addEventListener('canplay', handleCanPlay);

    return () => {
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('playing', handlePlaying);
      video.removeEventListener('canplay', handleCanPlay);
    };
  }, [onBuffering]);

  if (error) {
    return (
      <div className="flex items-center justify-center bg-black/10 rounded p-8">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <video
        ref={videoRef}
        controls
        playsInline
        preload="metadata"
        poster={poster}
        className={className || 'w-full h-auto'}
        crossOrigin="anonymous"
        style={{
          // Hardware acceleration
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden',
          willChange: 'transform',
        }}
      />

      {/* Buffering Indicator */}
      {isBuffering && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-black/50 backdrop-blur-sm px-4 py-2 rounded text-white text-sm">
            Buffering...
          </div>
        </div>
      )}
    </div>
  );
}
