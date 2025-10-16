'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import Image from 'next/image';

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false); // Start unmuted (sound on)
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [mounted, setMounted] = useState(false);

  const togglePlay = useCallback(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch((err: unknown) => {
          console.error('Playback error:', err);
        });
      }
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying]);

  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  }, [isMuted]);

  const toggleFullScreen = useCallback(() => {
    if (videoRef.current) {
      if (!document.fullscreenElement) {
        videoRef.current.requestFullscreen().catch((err: unknown) => {
          console.error('Fullscreen error:', err);
        });
      } else {
        document.exitFullscreen();
      }
    }
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Set mounted state on client side only
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Throttle time updates to reduce overhead
    let lastUpdate = 0;
    const handleTimeUpdate = () => {
      const now = Date.now();
      if (now - lastUpdate > 100) { // Update max 10 times per second
        setCurrentTime(video.currentTime);
        lastUpdate = now;
      }
    };

    const handleLoadedMetadata = () => {
      if (video.duration && !isNaN(video.duration)) {
        setDuration(video.duration);
      }
    };

    const handlePlay = () => {
      setIsPlaying(true);
      setIsBuffering(false);
    };

    const handlePause = () => setIsPlaying(false);

    // Critical: Monitor buffering for smooth playback
    const handleWaiting = () => setIsBuffering(true);
    const handleCanPlay = () => setIsBuffering(false);
    const handleCanPlayThrough = () => setIsBuffering(false);
    const handlePlaying = () => setIsBuffering(false);

    // Track buffer progress for large video file (536MB)
    const handleProgress = () => {
      // Buffer progress tracking - can be used for progress bar if needed
      if (video.buffered.length > 0 && video.duration) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1);
        const percent = (bufferedEnd / video.duration) * 100;
        // Available for future use: percent
        console.debug('Buffer progress:', percent.toFixed(1) + '%');
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('canplaythrough', handleCanPlayThrough);
    video.addEventListener('playing', handlePlaying);
    video.addEventListener('progress', handleProgress);

    // Check if duration is already available
    if (video.duration && !isNaN(video.duration)) {
      setDuration(video.duration);
    }

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('canplaythrough', handleCanPlayThrough);
      video.removeEventListener('playing', handlePlaying);
      video.removeEventListener('progress', handleProgress);
    };
  }, []);

  useEffect(() => {
    // Check for dark mode
    const checkDarkMode = () => {
      const darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(darkMode);
    };

    checkDarkMode();

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);
    mediaQuery.addEventListener('change', handler);

    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return (
    <main className="relative w-screen h-screen bg-white dark:bg-black overflow-hidden">
      {/* Logo - Mobile: center top, Desktop: top right */}
      <button
        onClick={() => setShowOverlay(!showOverlay)}
        className="absolute top-8 left-1/2 -translate-x-1/2 md:left-auto md:right-8 md:translate-x-0 z-50 cursor-pointer hover:opacity-80 transition-opacity"
      >
        <Image
          src={showOverlay ? '/fivefivefivewhite_bar-8.png' : (isDarkMode ? '/fivefivefivewhite_bar-8.png' : '/fivefivefiveblack_bar-8.png')}
          alt="555 Logo"
          width={120}
          height={40}
          priority
        />
      </button>

      {/* Overlay */}
      {showOverlay && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={() => setShowOverlay(false)}
        >
          <div
            className="absolute top-8 right-8 mt-16 text-white text-right max-w-md space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-sm leading-relaxed font-light">
              FiveFiveFive is a studio that produces creative transformation by exploring and interacting with ideas, people, and spaces.
            </p>
            <p className="text-sm leading-relaxed font-light">
              The studio creates environments for meaningful interaction, where collaboration and experimentation foster transformation.
            </p>
            <p className="text-sm leading-relaxed font-light">
              Through their work, they bridge the gap between vision and reality, crafting experiences that inspire change.
            </p>
            <div className="flex flex-col items-end gap-2 mt-6 text-sm font-light">
              <a
                href="https://luma.com/fivefivefive?k=c&period=past"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white/60 transition-colors"
              >
                Events
              </a>
              <a
                href="https://www.instagram.com/fivefivefive_studio/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white/60 transition-colors"
              >
                Instagram
              </a>
              <a
                href="https://x.com/555studio_"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white/60 transition-colors"
              >
                X
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Unified Video Player - Responsive */}
      <div className="flex items-center justify-center h-screen p-4">
        <div className="flex flex-col w-full max-w-5xl relative">
          <div className="relative w-full">
            <video
              ref={videoRef}
              playsInline
              preload="metadata"
              className="w-full h-auto max-h-[60vh] md:max-h-[70vh] object-contain"
            >
              <source
                src="/fivefivefive.mp4"
                type="video/mp4; codecs=avc1.42E01E,mp4a.40.2"
              />
              Your browser does not support the video tag.
            </video>

            {/* Buffering Indicator - Subtle */}
            {isBuffering && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="bg-black/50 backdrop-blur-sm px-4 py-2 rounded text-white text-sm">
                  Buffering...
                </div>
              </div>
            )}
          </div>

          {/* Responsive Controls - Stack on mobile, side-by-side on desktop */}
          <div className="flex flex-col md:flex-row items-center justify-between w-full mt-4 gap-3 md:gap-0 px-2">
            <div className="flex items-center gap-3">
              <button
                onClick={togglePlay}
                className={`px-3 py-1 text-sm border transition-all ${
                  isPlaying
                    ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white'
                    : 'text-black dark:text-white border-black/30 dark:border-white/30 hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                {isPlaying ? 'Pause' : 'Play'}
              </button>
              <span className="text-black dark:text-white font-mono text-sm" suppressHydrationWarning>
                {mounted ? `${formatTime(currentTime)} / ${formatTime(duration)}` : '0:00 / 0:00'}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={toggleMute}
                className={`px-3 py-1 text-sm border transition-all ${
                  isMuted
                    ? 'text-black dark:text-white border-black/30 dark:border-white/30 hover:bg-black/5 dark:hover:bg-white/5'
                    : 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white'
                }`}
              >
                {isMuted ? 'Unmute' : 'Mute'}
              </button>
              <button
                onClick={toggleFullScreen}
                className="px-3 py-1 text-sm text-black dark:text-white border border-black/30 dark:border-white/30 hover:bg-black/5 dark:hover:bg-white/5 transition-all"
              >
                Full Screen
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
