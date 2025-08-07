import React, { useEffect, useRef, useState } from "react";

export default function CustomYoutubePlayer({ videoId }) {
  const containerRef = useRef(null);
  const [player, setPlayer] = useState(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isVisible, setIsVisible] = useState(true);
  const playerReadyRef = useRef(false);
  const [countdown, setCountdown] = useState(10);
  const [showCountdown, setShowCountdown] = useState(true);

  // Initialize YouTube API and create player
  useEffect(() => {
    function createPlayer() {
      if (!window.YT || !window.YT.Player || !document.getElementById("youtube-player-container")) {
        return requestAnimationFrame(createPlayer);
      }

      const newPlayer = new window.YT.Player("youtube-player-container", {
        videoId: videoId,
        playerVars: {
          autoplay: 1,
          mute: 1,
          controls: 0,
          disablekb: 1,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
          fs: 0,
        },
        events: {
          onReady: (event) => {
        
            playerReadyRef.current = true;
            setPlayer(event.target);
          },
          onStateChange: (event) => {
            if (event.data === window.YT.PlayerState.ENDED) {
  
              setIsVisible(false);
            }
          },
          onError: (event) => {
            console.error("YouTube player error:", event.data);
          }
        }
      });
    }

    if (!window.YT) {
      if (!window.onYouTubeIframeAPIReady) {
        window.onYouTubeIframeAPIReady = createPlayer;
      }
      const scriptTag = document.createElement("script");
      scriptTag.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(scriptTag);
    } else {
      createPlayer();
    }

    return () => {
      window.onYouTubeIframeAPIReady = null;
      if (player && player.destroy) {
        player.destroy();
      }
    };
  }, [videoId]);

  // Countdown timer
  useEffect(() => {
    let timer;
    if (showCountdown && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else if (countdown === 0) {
      setShowCountdown(false);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [countdown, showCountdown]);

  // Reset countdown on page reload/video change
  useEffect(() => {
    setCountdown(6);
    setShowCountdown(true);
  }, [videoId]);

  // Handle keyboard events
  useEffect(() => {
    function handleKeyDown(event) {
      if (!playerReadyRef.current || !player) return;

      if (event.key.toLowerCase() === "m") {
        if (player.isMuted()) {
    
          player.unMute();
          player.setVolume(100);
          setIsMuted(false);
        } else {
    
          player.mute();
          setIsMuted(true);
        }
      } else if (event.key.toLowerCase() === "f") {
        if (containerRef.current) {
          if (!document.fullscreenElement) {
            containerRef.current.requestFullscreen?.();
          } else {
            document.exitFullscreen?.();
          }
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [player]);

  // Apply styles to prevent hover controls
  useEffect(() => {
    if (player && player.getIframe) {
      try {
        const iframe = player.getIframe();
        if (iframe) {
          iframe.style.pointerEvents = "none";
        }
      } catch (err) {
        console.error("Error setting iframe styles:", err);
      }
    }
  }, [player]);

  // Click-to-unmute feature
  function handleClick() {
    if (player && player.isMuted()) {
      player.unMute();
      player.setVolume(100);
      setIsMuted(false);
    }
  }

  if (!isVisible) return null; // Hide player when video ends

  return (
    <div 
      ref={containerRef}
      style={{
        width: "100%", 
        maxWidth: "800px",
        aspectRatio: "16/9",
        position: "relative",
        margin: "0 auto",
        backgroundColor: "#000",
        overflow: "hidden",
        cursor: "pointer"
      }}
      onClick={handleClick}
    >
      <div 
        id="youtube-player-container" 
        style={{
          width: "100%",
          height: "100%",
          position: "absolute",
          top: 0,
          left: 0
        }}
      ></div>
      
      {showCountdown && (
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#000",
          color: "#fff",
          fontSize: "48px",
          fontWeight: "bold",
          zIndex: 20,
          opacity: 1
        }}>
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center"
          }}>
            <div>{countdown}</div>
            <div style={{
              fontSize: "16px",
              marginTop: "10px"
            }}>Video loading...</div>
          </div>
        </div>
      )}
      
      <div style={{
        position: "absolute",
        bottom: "10px",
        left: "10px",
        backgroundColor: "#000",
        color: "#fff",
        padding: "5px 10px",
        borderRadius: "4px",
        fontSize: "12px",
        pointerEvents: "none",
        zIndex: 5
      }}>
        Press M to {isMuted ? "unmute" : "mute"} | Press F for fullscreen | Click to unmute
      </div>
    </div>
  );
}