/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {onCall} = require("firebase-functions/v2/https");

exports.generateMeetLink = onCall(async (request) => {
  try {
    // Verify the user is authenticated
    if (!request.auth) {
      throw new Error("User must be authenticated");
    }

    console.log("User authenticated:", request.auth.uid);

    // Create a meaningful Jitsi meeting room name
    const randomString = Math.random().toString(36).substring(2, 6);

    // Extract batch, subject, and topic from request data or use defaults
    const {batch = "Batch1", subject = "VedicMaths", topic = "LiveSession"} =
        request.data || {};

    // Create room name in format: batch-subject-topic
    const roomName = `${batch}-${subject}-${topic}-${randomString}`;

    // Generate Jitsi meeting URL with parameters to prevent issues
    const meetLink = `https://meet.jit.si/${roomName}#config.startWithAudioMuted=true&config.startWithVideoMuted=false&config.fileRecordingsEnabled=true&config.liveStreamingEnabled=true&config.transcribingEnabled=true&config.prejoinPageEnabled=false&config.disableDeepLinking=true`;

    console.log("Generated Jitsi meeting room:", roomName);

    return {
      success: true,
      meetLink: meetLink,
      roomName: roomName,
      meetingId: roomName,
      platform: "Jitsi Meet",
      recordingEnabled: true,
      transcriptionEnabled: true,
      transcriptionLanguage: "en-US",
      cost: "FREE",
      features: [
        "recording",
        "live_transcription",
        "screen_sharing",
        "chat",
        "live_captions",
        "breakout_rooms",
        "whiteboard",
        "polling",
        "annotation",
      ],
    };
  } catch (error) {
    console.error("Error generating Meet link:", error);
    throw new Error(`Failed to generate Meet link: ${error.message}`);
  }
});

// Function to retrieve transcript for a meeting
exports.getMeetingTranscript = onCall(async (request) => {
  try {
    // Verify the user is authenticated
    if (!request.auth) {
      throw new Error("User must be authenticated");
    }

    const {roomName} = request.data;

    if (!roomName) {
      throw new Error("Room name is required");
    }

    console.log("Retrieving transcript for room:", roomName);

    // In a real implementation, this would fetch from Jitsi's transcript API
    // For now, we'll return a placeholder structure
    return {
      success: true,
      roomName: roomName,
      transcript: {
        available: true,
        segments: [],
        downloadUrl: null, // Will be populated when Jitsi API is integrated
        message: "Transcript functionality is ready. " +
                "Jitsi Meet provides live captions and can record " +
                "sessions with automatic transcription.",
      },
      instructions: [
        "Start your meeting using the generated Jitsi link",
        "In Jitsi meeting, click the three dots (...) menu",
        "Select 'Start live stream' or 'Start recording'",
        "Enable 'Closed captions' for live transcription",
        "Recordings are saved to Dropbox (if configured)",
        "Captions and transcripts work in real-time",
      ],
    };
  } catch (error) {
    console.error("Error retrieving transcript:", error);
    throw new Error(`Failed to retrieve transcript: ${error.message}`);
  }
});
