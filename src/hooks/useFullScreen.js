import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for managing fullscreen functionality in exam interface
 * @param {Object} config - Configuration object
 * @param {boolean} config.isExamStarted - Whether the exam has started
 * @param {boolean} config.hasSubmitted - Whether the exam has been submitted
 * @returns {Object} Fullscreen state and functions
 */
export const useFullScreen = ({ 
  isExamStarted = false, 
  hasSubmitted = false 
} = {}) => {
  const [showExitModal, setShowExitModal] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Function to enter fullscreen mode
  const enterFullscreen = useCallback(async () => {
    try {
      const element = document.documentElement;

      if (element.requestFullscreen) {
        await element.requestFullscreen();
      } else if (element.webkitRequestFullscreen) {
        // Safari
        await element.webkitRequestFullscreen();
      } else if (element.msRequestFullscreen) {
        // IE11
        await element.msRequestFullscreen();
      }
    } catch (error) {
      console.error("Fullscreen error:", error);
    }
  }, []);

  // Function to exit fullscreen mode
  const exitFullscreen = useCallback(async () => {
    try {
      if (document.fullscreenElement || document.webkitFullscreenElement) {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          await document.webkitExitFullscreen();
        }
      }
    } catch (error) {
      console.error("Exit fullscreen error:", error);
    }
  }, []);

  // Check if currently in fullscreen
  const checkFullscreenStatus = useCallback(() => {
    const isCurrentlyFullscreen = !!(
      document.fullscreenElement || 
      document.webkitFullscreenElement || 
      document.mozFullScreenElement || 
      document.msFullscreenElement
    );
    setIsFullScreen(isCurrentlyFullscreen);
    return isCurrentlyFullscreen;
  }, []);

  // Handle fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = checkFullscreenStatus();
      
      // Show exit modal if user tries to exit fullscreen during exam
      if (!isCurrentlyFullscreen && isExamStarted && !hasSubmitted) {
        setShowExitModal(true);
      }
    };

    const handleKeydown = (e) => {
      // Prevent escape key from exiting fullscreen during exam
      if (e.key === "Escape" && isExamStarted && !hasSubmitted) {
        e.preventDefault();
        setShowExitModal(true);
      }
    };

    // Add event listeners for different browsers
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);
    document.addEventListener("msfullscreenchange", handleFullscreenChange);
    document.addEventListener("keydown", handleKeydown);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
      document.removeEventListener("mozfullscreenchange", handleFullscreenChange);
      document.removeEventListener("msfullscreenchange", handleFullscreenChange);
      document.removeEventListener("keydown", handleKeydown);
    };
  }, [isExamStarted, hasSubmitted, checkFullscreenStatus]);

  // Auto-enter fullscreen when exam starts with delay
  useEffect(() => {
    if (isExamStarted && !hasSubmitted) {
      const timeoutId = setTimeout(() => {
        enterFullscreen();
      }, 1000); // Small delay to let the page load

      return () => clearTimeout(timeoutId);
    }
  }, [isExamStarted, hasSubmitted, enterFullscreen]);

  // Prevent page interactions that could exit fullscreen
  useEffect(() => {
    if (!isExamStarted || hasSubmitted) return;

    // Prevent page reload
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = "";
      return "";
    };

    // Prevent keyboard shortcuts
    const handleKeyDown = (e) => {
      if (
        // Reload: Ctrl+R, Command+R, F5
        (e.key === "r" && (e.ctrlKey || e.metaKey)) ||
        e.key === "F5" ||
        // Forward/Back: Alt+Left/Right, Command+Left/Right
        ((e.altKey || e.metaKey) && ["ArrowLeft", "ArrowRight"].includes(e.key))
      ) {
        e.preventDefault();
        return false;
      }
    };

    // Block right click
    const handleContextMenu = (e) => {
      e.preventDefault();
    };

    // Add event listeners
    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("contextmenu", handleContextMenu);

    // Cleanup
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("contextmenu", handleContextMenu);
    };
  }, [isExamStarted, hasSubmitted]);

  // Re-enter fullscreen if user somehow exits
  useEffect(() => {
    if (!isExamStarted || hasSubmitted) return;

    const handleFullscreenExit = () => {
      if (!document.fullscreenElement && !document.webkitFullscreenElement) {
        // Re-enter fullscreen after a short delay
        setTimeout(() => {
          enterFullscreen();
        }, 100);
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenExit);
    document.addEventListener("webkitfullscreenchange", handleFullscreenExit);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenExit);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenExit);
    };
  }, [isExamStarted, hasSubmitted, enterFullscreen]);

  // Handle exit modal confirmation
  const handleExitModalConfirm = useCallback(async () => {
    await enterFullscreen();
    setShowExitModal(false);
  }, [enterFullscreen]);

  const handleExitModalCancel = useCallback(() => {
    setShowExitModal(false);
  }, []);

  return {
    // State
    isFullScreen,
    showExitModal,
    
    // Functions
    enterFullscreen,
    exitFullscreen,
    checkFullscreenStatus,
    handleExitModalConfirm,
    handleExitModalCancel,
    
    // Modal state setters
    setShowExitModal
  };
};

export default useFullScreen;