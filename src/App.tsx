import React, { useEffect, useState } from 'react';
import './App.css';
import { List, Text, CopyButton, Tooltip, ActionIcon, Button, Paper, Center, Container, Title } from '@mantine/core';
import { Microphone, PlayerStop, TextCaption, Check, Copy } from 'tabler-icons-react';
import { useAudioRecorder } from 'react-audio-voice-recorder';
import { Toaster, toast } from 'react-hot-toast';
import axios from 'axios'
import useSWRMutation from 'swr/mutation'

const baseURL = process.env.NODE_ENV === "production" ? "https://34.134.139.101:8080" : "http://localhost:8080"

const processTr = (url: any, { arg }: any) => {
  return axios({
    method: 'post',
    url: `${baseURL}/api/transcribe`,
    data: arg,
    headers: {
      'Content-Type': `mutlipart/form-data;`,
    }
  });
}

function App() {
  const [texts, setTexts] = useState<{ text: string }[]>([])
  const {
    startRecording,
    stopRecording,
    recordingBlob,
    isRecording,
    recordingTime
  } = useAudioRecorder();
  const [error, setError] = useState(false)

  const { trigger, isMutating } = useSWRMutation(['/api/transcribe', recordingBlob], processTr, {
    onSuccess: ({ data }) => {
      setTexts(prev => [...prev, {
        text: data.text,
      }])
    }
  })

  const handleStart = () => {
    startRecording()
  }

  const handleStop = () => {
    if (recordingTime < 3) {
      toast.error("Recording time must be more than 2 seconds")
      setError(true)
    } else {
      setError(false)
    }
    stopRecording()
  }

  const handleTranscribe = async () => {
    if (recordingBlob) {
      const audioFile = new File([recordingBlob], "audio.webm", { type: 'audio/webm;' });
      const formData = new FormData();
      formData.append("file", audioFile);
      trigger(formData)

    } else {
      throw new Error("No recording, please record first.")
    }
  }

  return (
    <div className="App">
      <Center>
        <Container size="md" mt={"10%"}>
          <Title
            variant="gradient"
            gradient={{ from: 'indigo', to: 'cyan', deg: 45 }}
            sx={{ fontFamily: 'Greycliff CF, sans-serif' }}
            ta="center"
            fw={700}
          >
            Georgian Speech-To-Text Transcriber
          </Title>
          <Paper shadow="md" p={25}>
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
                loading={isMutating}
                disabled={!recordingBlob || isRecording || error}
                onClick={handleTranscribe}
                leftIcon={<TextCaption />}
                fullWidth
                mt={10}
                variant="subtle">
                {"Transcribe"}
              </Button>
            </div>
            <List>
              {texts.map(item => (
                <Paper shadow="xs" p="md" mt={10}>
                  <Text>{item.text}
                  </Text>
                  <CopyButton value={item.text} timeout={2000}>
                    {({ copied, copy }) => (
                      <Tooltip label={copied ? 'Copied' : 'Copy'} withArrow position="right">
                        <ActionIcon color={copied ? 'teal' : 'gray'} onClick={copy}>
                          {copied ? <Check size={16} /> : <Copy size={16} />}
                        </ActionIcon>
                      </Tooltip>
                    )}
                  </CopyButton>
                </Paper>
              ))}
            </List>
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
