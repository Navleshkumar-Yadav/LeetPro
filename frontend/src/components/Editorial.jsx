import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pause, Play, Video, Clock, User } from 'lucide-react';
import AnimatedCard from './AnimatedCard.jsx';

const Editorial = ({ videos }) => {
  const [activeTab, setActiveTab] = useState('optimal');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const videoRef = useRef(null);

  // Set default tab based on available videos
  useEffect(() => {
    if (videos) {
      if (videos['optimal']) {
        setActiveTab('optimal');
      } else if (videos['brute-force']) {
        setActiveTab('brute-force');
      }
    }
  }, [videos]);

  // Format seconds to MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Update current time during playback
  useEffect(() => {
    const video = videoRef.current;
    
    const handleTimeUpdate = () => {
      if (video) setCurrentTime(video.currentTime);
    };
    
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    
    if (video) {
      video.addEventListener('timeupdate', handleTimeUpdate);
      video.addEventListener('play', handlePlay);
      video.addEventListener('pause', handlePause);
      
      return () => {
        video.removeEventListener('timeupdate', handleTimeUpdate);
        video.removeEventListener('play', handlePlay);
        video.removeEventListener('pause', handlePause);
      };
    }
  }, [activeTab]);

  if (!videos || (!videos['optimal'] && !videos['brute-force'])) {
    return (
      <AnimatedCard className="text-center py-12">
        <Video className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-400 mb-2">No Videos Available</h3>
        <p className="text-gray-500">Editorial videos will be available soon</p>
      </AnimatedCard>
    );
  }

  const currentVideo = videos[activeTab];
  const availableTabs = Object.keys(videos).filter(key => videos[key]);

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      {availableTabs.length > 1 && (
        <div className="flex space-x-1 bg-gray-800/50 rounded-lg p-1">
          {availableTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all ${
                activeTab === tab
                  ? tab === 'brute-force' 
                    ? 'bg-orange-600 text-white shadow-lg'
                    : 'bg-green-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${
                tab === 'brute-force' ? 'bg-orange-400' : 'bg-green-400'
              }`} />
              <span className="font-medium capitalize">
                {tab === 'brute-force' ? 'Brute Force' : 'Optimal'}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Video Player */}
      <AnimatePresence mode="wait">
        {currentVideo && (
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <AnimatedCard className="overflow-hidden">
              {/* Video Info Header */}
              <div className="p-4 border-b border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">
                      {currentVideo.title || `${activeTab === 'brute-force' ? 'Brute Force' : 'Optimal'} Solution`}
                    </h3>
                    {currentVideo.description && (
                      <p className="text-sm text-gray-400">{currentVideo.description}</p>
                    )}
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-400">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{formatTime(currentVideo.duration)}</span>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      activeTab === 'brute-force'
                        ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                        : 'bg-green-500/20 text-green-400 border border-green-500/30'
                    }`}>
                      {activeTab === 'brute-force' ? 'Brute Force' : 'Optimal'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Video Container */}
              <div 
                className="relative w-full aspect-video bg-black"
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
              >
                {/* Video Element */}
                <video
                  ref={videoRef}
                  src={currentVideo.secureUrl}
                  poster={currentVideo.thumbnailUrl}
                  onClick={togglePlayPause}
                  className="w-full h-full cursor-pointer"
                  onLoadedData={() => {
                    setCurrentTime(0);
                    setIsPlaying(false);
                  }}
                />
                
                {/* Video Controls Overlay */}
                <div 
                  className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 transition-opacity ${
                    isHovering || !isPlaying ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    {/* Play/Pause Button */}
                    <button
                      onClick={togglePlayPause}
                      className={`p-2 rounded-full transition-colors ${
                        activeTab === 'brute-force'
                          ? 'bg-orange-600 hover:bg-orange-500'
                          : 'bg-green-600 hover:bg-green-500'
                      }`}
                      aria-label={isPlaying ? "Pause" : "Play"}
                    >
                      {isPlaying ? (
                        <Pause className="w-5 h-5 text-white" />
                      ) : (
                        <Play className="w-5 h-5 text-white" />
                      )}
                    </button>
                    
                    {/* Progress Bar */}
                    <div className="flex items-center flex-1 space-x-3">
                      <span className="text-white text-sm font-mono">
                        {formatTime(currentTime)}
                      </span>
                      <input
                        type="range"
                        min="0"
                        max={currentVideo.duration}
                        value={currentTime}
                        onChange={(e) => {
                          if (videoRef.current) {
                            videoRef.current.currentTime = Number(e.target.value);
                          }
                        }}
                        className={`flex-1 h-1 rounded-lg appearance-none cursor-pointer ${
                          activeTab === 'brute-force'
                            ? 'bg-gray-700 slider-orange'
                            : 'bg-gray-700 slider-green'
                        }`}
                        style={{
                          background: `linear-gradient(to right, ${
                            activeTab === 'brute-force' ? '#ea580c' : '#16a34a'
                          } 0%, ${
                            activeTab === 'brute-force' ? '#ea580c' : '#16a34a'
                          } ${(currentTime / currentVideo.duration) * 100}%, #374151 ${(currentTime / currentVideo.duration) * 100}%, #374151 100%)`
                        }}
                      />
                      <span className="text-white text-sm font-mono">
                        {formatTime(currentVideo.duration)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Thumbnail overlay when video is not playing */}
                {!isPlaying && currentVideo.thumbnailUrl && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <button
                      onClick={togglePlayPause}
                      className={`p-4 rounded-full transition-all hover:scale-110 ${
                        activeTab === 'brute-force'
                          ? 'bg-orange-600/80 hover:bg-orange-500'
                          : 'bg-green-600/80 hover:bg-green-500'
                      }`}
                    >
                      <Play className="w-8 h-8 text-white" />
                    </button>
                  </div>
                )}
              </div>
            </AnimatedCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Video Description */}
      {currentVideo?.description && (
        <AnimatedCard>
          <h4 className="text-lg font-semibold text-white mb-3">About this video</h4>
          <p className="text-gray-300 leading-relaxed">{currentVideo.description}</p>
        </AnimatedCard>
      )}
    </div>
  );
};

export default Editorial;