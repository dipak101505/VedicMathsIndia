import { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { Link } from "react-router-dom";
import { db } from "../firebase/config";
import {
  StudentMeetingsContainer,
  PageTitle,
  LoadingContainer,
  MeetingsList,
  MeetingCard,
  MeetingDetails,
  MeetingTitle,
  MeetingInfo,
  MeetingActions,
  JoinButton,
  WatchRecordingButton,
  StatusBadge
} from "../styles/studentMeetings.styles";

function StudentMeetingsPage() {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const meetingsRef = collection(db, "meetings");
    const q = query(meetingsRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const meetingsList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMeetings(meetingsList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <StudentMeetingsContainer>
      <PageTitle>Available Classes</PageTitle>

      {loading ? (
        <LoadingContainer>Loading...</LoadingContainer>
      ) : (
        <MeetingsList>
          {meetings.map((meeting) => (
            <MeetingCard key={meeting.id}>
              <MeetingDetails>
                <MeetingTitle>
                  {meeting.subject} - {meeting.topic}
                </MeetingTitle>
                <MeetingInfo>Batch: {meeting.batch}</MeetingInfo>
                <MeetingInfo>
                  Status: <StatusBadge status={meeting.status}>{meeting.status}</StatusBadge>
                </MeetingInfo>
              </MeetingDetails>
              <MeetingActions>
                {meeting.status === "scheduled" && (
                  <JoinButton
                    href={meeting.joinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Join Class
                  </JoinButton>
                )}
                {meeting.status === "completed" && meeting.recordingKey && (
                  <WatchRecordingButton
                    to={`/play/${encodeURIComponent(meeting.recordingKey)}`}
                  >
                    Watch Recording
                  </WatchRecordingButton>
                )}
              </MeetingActions>
            </MeetingCard>
          ))}
        </MeetingsList>
      )}
    </StudentMeetingsContainer>
  );
}

export default StudentMeetingsPage;
