'use client';

import { useRef, useState, useEffect } from 'react';
import Image from 'next/image';

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullScreen = () => {
    if (videoRef.current) {
      if (!document.fullscreenElement) {
        videoRef.current.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    const handleDurationChange = () => {
      setDuration(video.duration);
    };

    const handleCanPlay = () => {
      if (video.duration && !isNaN(video.duration)) {
        setDuration(video.duration);
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('durationchange', handleDurationChange);
    video.addEventListener('canplay', handleCanPlay);

    // Also check if duration is already available
    if (video.duration && !isNaN(video.duration)) {
      setDuration(video.duration);
    }

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('durationchange', handleDurationChange);
      video.removeEventListener('canplay', handleCanPlay);
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

      {/* Desktop: Video centered with controls directly below */}
      <div className="hidden md:flex items-center justify-center h-screen">
        <div className="flex flex-col">
          <video
            ref={videoRef}
            playsInline
            className="w-auto h-auto max-w-[60vw] max-h-[50vh]"
          >
            <source src="https://pub-69601e5d64b84c9db63cff92d061c0bc.r2.dev/fivefivefive.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>

          {/* Desktop Controls - Play/Time on left, Mute/Fullscreen on right */}
          <div className="flex items-center justify-between w-full mt-3">
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
              <span className="text-black dark:text-white font-mono text-sm">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={toggleMute}
                className={`px-3 py-1 text-sm border transition-all ${
                  !isMuted 
                    ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white' 
                    : 'text-black dark:text-white border-black/30 dark:border-white/30 hover:bg-black/5 dark:hover:bg-white/5'
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

      {/* Mobile: Video centered with controls at bottom */}
      <div className="md:hidden absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <video
          ref={videoRef}
          playsInline
          className="w-auto h-auto max-w-[90vw] max-h-[50vh]"
        >
          <source src="https://pub-69601e5d64b84c9db63cff92d061c0bc.r2.dev/fivefivefive.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>

      {/* Mobile Controls - Fixed at bottom with time inline */}
      <div className="md:hidden fixed left-0 right-0 flex flex-col items-center" style={{ bottom: '60px' }}>
        <div className="flex items-center gap-3 mb-3">
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
          <span className="text-black dark:text-white font-mono text-sm">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>
        
        {/* Second row: Mute and Fullscreen */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleMute}
            className={`px-3 py-1 text-sm border transition-all ${
              !isMuted 
                ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white' 
                : 'text-black dark:text-white border-black/30 dark:border-white/30 hover:bg-black/5 dark:hover:bg-white/5'
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
    </main>
  );
}
