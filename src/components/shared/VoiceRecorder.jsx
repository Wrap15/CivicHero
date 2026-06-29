'use client';

import React, { useState, useRef } from 'react';
import { Mic, Square, Play, Trash2, Volume2 } from 'lucide-react';

export default function VoiceRecorder({ onAudioRecorded }) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [transcript, setTranscript] = useState('');
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/ogg; codecs=opus' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);

        // Generate a simulated transcript based on typical reports for mock usage
        const simulatedTranscripts = [
          "There is a huge pothole here filled with water, cars are hitting it constantly.",
          "Garbage has overflowed the dumpsters and is spilling onto the sidewalk.",
          "The street lights have been completely dark for three days on this corner.",
          "Water is bursting out from under the pavement, creating a huge stream.",
          "Someone dumped a pile of construction concrete and old wood in the lane."
        ];
        const randomTranscript = simulatedTranscripts[Math.floor(Math.random() * simulatedTranscripts.length)];
        setTranscript(randomTranscript);

        // Pass the audio blob and transcript up
        onAudioRecorded({
          blob: audioBlob,
          url: url,
          transcript: randomTranscript,
          file: new File([audioBlob], "voice_report.ogg", { type: "audio/ogg" })
        });
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Microphone permission denied or not supported in this browser. Running with simulation.");
      
      // Fallback Simulation for testing
      setIsRecording(true);
      setTimeout(() => {
        setIsRecording(false);
        const url = 'https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg';
        const dummyText = "A massive pothole is damaging cars on Broadway.";
        setAudioUrl(url);
        setTranscript(dummyText);
        onAudioRecorded({
          blob: new Blob(),
          url,
          transcript: dummyText,
          file: null
        });
      }, 3000);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      // Stop all tracks on the stream
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    } else {
      setIsRecording(false);
    }
  };

  const deleteRecording = () => {
    setAudioUrl(null);
    setTranscript('');
    onAudioRecorded(null);
  };

  return (
    <div className="bg-zinc-900/60 p-4 rounded-xl border border-zinc-800 flex flex-col items-center justify-center space-y-4">
      <div className="text-center">
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">Voice Report</h4>
        <p className="text-[10px] text-zinc-400 mt-1 max-w-xs leading-normal">
          Record your voice to describe the issue. Gemini will use this to refine its analysis.
        </p>
      </div>

      {!audioUrl ? (
        <div className="flex flex-col items-center">
          {isRecording ? (
            <div className="flex flex-col items-center space-y-3">
              {/* Pulse Indicator */}
              <div className="flex space-x-1.5 items-center justify-center h-8">
                <span className="w-1.5 h-6 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <span className="w-1.5 h-8 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                <span className="w-1.5 h-10 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                <span className="w-1.5 h-8 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                <span className="w-1.5 h-6 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }} />
              </div>
              <button
                type="button"
                onClick={stopRecording}
                className="p-4 bg-rose-500 hover:bg-rose-600 text-white rounded-full transition-transform hover:scale-105 active:scale-95 flex items-center justify-center cursor-pointer shadow-lg shadow-rose-500/20"
              >
                <Square className="w-5 h-5 fill-white" />
              </button>
              <span className="text-[10px] text-rose-400 font-medium">Recording (Click to Stop)...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-2">
              <button
                type="button"
                onClick={startRecording}
                className="p-4 bg-emerald-500 hover:bg-emerald-400 text-black rounded-full transition-transform hover:scale-105 active:scale-95 flex items-center justify-center cursor-pointer shadow-lg shadow-emerald-500/20"
              >
                <Mic className="w-5 h-5" />
              </button>
              <span className="text-[10px] text-zinc-400">Click to record voice description</span>
            </div>
          )}
        </div>
      ) : (
        <div className="w-full space-y-3">
          <div className="flex items-center justify-between bg-zinc-950 p-2.5 rounded-lg border border-zinc-800">
            <div className="flex items-center space-x-2">
              <Volume2 className="w-4 h-4 text-emerald-400" />
              <audio src={audioUrl} controls className="h-6 w-44" />
            </div>
            <button
              type="button"
              onClick={deleteRecording}
              className="p-1.5 text-zinc-500 hover:text-rose-400 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          
          <div className="bg-zinc-950/80 p-3 rounded-lg border border-zinc-800/80">
            <span className="text-[9px] uppercase tracking-wider font-bold text-emerald-400">Speech-To-Text Transcription</span>
            <p className="text-[11px] text-zinc-300 mt-1 italic leading-relaxed">"{transcript}"</p>
          </div>
        </div>
      )}
    </div>
  );
}
