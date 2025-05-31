"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { extractYouTubeVideoId } from '@/utils/youtube'

type YouTubePlayerProps = {
  videoId: string
  title: string
}

export default function YouTubePlayer({ videoId: rawVideoId, title }: YouTubePlayerProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const videoId = extractYouTubeVideoId(rawVideoId);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  if (!videoId) {
    return (
      <div className="relative aspect-video bg-dark-400 rounded-xl flex items-center justify-center">
        <p className="text-white/70">Недействительная ссылка на видео</p>
      </div>
    );
  }
  
  return (
    <div className="relative aspect-video rounded-xl overflow-hidden">
      {!isLoaded && (
        <div className="absolute inset-0 bg-dark-400 flex items-center justify-center">
          <div className="animate-spin h-12 w-12 border-4 border-primary-500 rounded-full border-t-transparent"></div>
        </div>
      )}
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoaded ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      >
        <iframe
          width="100%"
          height="100%"
          src={`https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0&showinfo=0`}
          title={title}
          className="absolute inset-0 w-full h-full"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </motion.div>
    </div>
  );
} 