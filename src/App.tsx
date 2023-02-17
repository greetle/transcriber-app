import React, { useEffect } from 'react';
import './App.css';
import { Text, Button, Paper, Center, Container } from '@mantine/core';
import { Microphone, PlayerStop, TextCaption } from 'tabler-icons-react';
import { useAudioRecorder } from 'react-audio-voice-recorder';
import { Toaster, toast } from 'react-hot-toast';
import axios from 'axios';
function App() {
  const {
    startRecording,
    stopRecording,
    togglePauseResume,
    recordingBlob,
    isRecording,
    isPaused,
    recordingTime,
  } = useAudioRecorder();

  const handleStart = () => {
    startRecording()
  }

  const handleStop = () => {
    stopRecording()
  }

  useEffect(() => {
    toast.dismiss()
    if (recordingBlob) {
      const url = URL.createObjectURL(recordingBlob);
      toast((t) => (
        <span id="#recorded">
          <audio
            controls
            src={url}>
            <a href={url}>
              Download audio
            </a>
          </audio>
        </span>
      ));
    }
  }, [recordingBlob])

  const handleTranscribe = async () => {
    if (recordingBlob) {
      const audioFile = new File([recordingBlob], "audio.webm", { type: 'audio/webm;' });
      const formData = new FormData();
      formData.append("file", audioFile);

      const response = await axios({
        method: 'post',
        url: `http://localhost:9050/api/transcribe`,
        data: formData,
        headers: {
          'Content-Type': `mutlipart/form-data;`,
        }
      });

    } else {
      throw new Error("No recording, please record first.")
    }
  }

  return (
    <div className="App">
      <Center>
        <Container size="md" mt={"10%"}>
          <Paper shadow="md" p={25}>
            <Text
              variant="gradient"
              gradient={{ from: 'indigo', to: 'cyan', deg: 45 }}
              sx={{ fontFamily: 'Greycliff CF, sans-serif' }}
              ta="center"
              fz="xl"
              fw={700}
            >
              Record audio to transcribe
            </Text>
            <div className="flex mt-10">
              <Button
                fullWidth
                onClick={isRecording ? handleStop : handleStart}
                mt={10}
                leftIcon={isRecording ? <PlayerStop /> : <Microphone />}
                variant="gradient" gradient={{ from: '#ed6ea0', to: isRecording ? '#ed6ea0' : '#ec8c69', deg: 35 }}>
                {isRecording ? "Recording..." : "Record"}
              </Button>
              <Button
                disabled={!recordingBlob}
                onClick={handleTranscribe}
                leftIcon={<TextCaption />}
                fullWidth
                mt={10}
                variant="subtle">
                {"Transcribe"}
              </Button>
            </div>
          </Paper>
        </Container>
      </Center>
      <Toaster
        position="top-center"
        reverseOrder={false}
      />
    </div>
  );
}

export default App;
