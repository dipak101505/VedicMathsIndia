import { useEffect, useRef, useState } from "react";
import Artplayer from "artplayer";
import Hls from "hls.js";
import { useParams } from "react-router-dom";
import { getLectureNotes } from "../services/lectureNotesService";

const VideoPlayer = () => {
  const artRef = useRef();
  const { videoKey } = useParams();
  const [lectureNotes, setLectureNotes] = useState(null);
  const [lectureImage, setLectureImage] = useState(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isZoomed, setIsZoomed] = useState(false);

  // Fetch lecture notes and image
  useEffect(() => {
    const fetchLectureData = async () => {
      try {
        setIsLoading(true);
        setImageLoading(true);
        const notes = await getLectureNotes(videoKey);

        if (notes?.imageBase64) {
          setLectureImage(notes.imageBase64);
        }
        setLectureNotes(notes);
      } catch (err) {
        console.error("Error fetching lecture data:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
        setImageLoading(false);
      }
    };

    if (videoKey) {
      fetchLectureData();
    }
  }, [videoKey]);

  useEffect(() => {
    // Function to handle HLS playback
    function playM3u8(video, url, art) {
      if (Hls.isSupported()) {
        if (art.hls) art.hls.destroy();
        const hls = new Hls();
        hls.loadSource(url);
        hls.attachMedia(video);
        art.hls = hls;
        art.on("destroy", () => hls.destroy());
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = url;
      } else {
        art.notice.show = "HLS is not supported for this browser";
      }
    }

    const art = new Artplayer({
      container: artRef.current,
      url: `https://vz-d5d4ebc7-6d2.b-cdn.net/${videoKey}/playlist.m3u8`,
      volume: 0.5,
      isLive: false,
      muted: false,
      autoplay: false,
      pip: true,
      autoSize: true,
      autoMini: true,
      screenshot: false,
      setting: true,
      loop: false,
      flip: true,
      playbackRate: true,
      aspectRatio: true,
      fullscreen: true,
      fullscreenWeb: true,
      subtitleOffset: true,
      miniProgressBar: true,
      mutex: true,
      backdrop: true,
      playsInline: true,
      autoPlayback: true,
      theme: "#ff0000",
      preload: "auto",
      videoAttribute: {
        preload: "auto",
        "x-webkit-airplay": "allow",
        "webkit-playsinline": "true",
        playsinline: "true",
        "x-playsinline": "true",
      },
      customType: {
        m3u8: function (video, url) {
          if (Hls.isSupported()) {
            const hls = new Hls({
              maxBufferSize: 0,
              maxBufferLength: 5, // 1 minute in seconds
              maxMaxBufferLength: 10, // 2 minutes in seconds
              liveDurationInfinity: false,
            });
            hls.loadSource(url);
            hls.attachMedia(video);
          }
        },
      },
    });

    return () => {
      if (art && art.destroy) {
        art.destroy(false);
      }
    };
  }, [videoKey]);

  return (
    <div>
      <div ref={artRef} style={{ width: "100%", height: "500px" }} />

      {/* Lecture Notes Section with Image Above */}
      <div style={{ padding: "20px" }}>
        {isLoading ? (
          <div>Loading notes...</div>
        ) : error ? (
          <div style={{ color: "red" }}>{error}</div>
        ) : lectureNotes ? (
          <div>
            {/* Image Section */}
            {imageLoading ? (
              <div>Loading image...</div>
            ) : (
              lectureImage && (
                <div
                  style={{
                    marginBottom: "24px",
                    maxWidth: "600px",
                    margin: "0 auto 24px auto",
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      position: isZoomed ? "fixed" : "relative",
                      top: isZoomed ? "50%" : "auto",
                      left: isZoomed ? "50%" : "auto",
                      transform: isZoomed ? "translate(-50%, -50%)" : "none",
                      zIndex: isZoomed ? 1000 : 1,
                      width: isZoomed ? "80vw" : "100%",
                      cursor: "zoom-out",
                    }}
                  >
                    <img
                      src={lectureImage}
                      alt="Lecture Notes"
                      style={{
                        width: "100%",
                        height: "auto",
                        borderRadius: "8px",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                        transition: "all 0.3s ease",
                        cursor: isZoomed ? "zoom-out" : "zoom-in",
                      }}
                      onClick={() => setIsZoomed(!isZoomed)}
                      onError={() => {
                        setLectureImage(null);
                        setError("Failed to load image");
                      }}
                    />
                  </div>
                  {isZoomed && (
                    <div
                      onClick={() => setIsZoomed(false)}
                      style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: "rgba(0, 0, 0, 0.75)",
                        zIndex: 999,
                        cursor: "zoom-out",
                      }}
                    />
                  )}
                </div>
              )
            )}

            {/* Notes Section */}
            <div>
              <h2
                style={{
                  fontSize: "24px",
                  color: "#2d3748",
                  marginBottom: "16px",
                }}
              >
                {lectureNotes.title}
              </h2>
              <div
                className="lecture-notes-content"
                dangerouslySetInnerHTML={{ __html: lectureNotes.content }}
                style={{
                  fontSize: "16px",
                  lineHeight: "1.6",
                  color: "#4a5568",
                  marginLeft: "auto",
                }}
              />
            </div>
          </div>
        ) : (
          <div
            style={{
              padding: "20px",
              textAlign: "center",
              color: "#718096",
            }}
          >
            No notes available for this lecture
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoPlayer;
