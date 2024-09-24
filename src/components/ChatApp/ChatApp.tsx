import React, { useEffect, useRef, useState } from 'react';
import SimplePeer, { Instance, SignalData } from 'simple-peer';

const ChatApp: React.FC = () => {
  const [peer, setPeer] = useState<Instance | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Access user's video/audio stream
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((mediaStream) => {
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    });

    if (stream) {
      const newPeer = new SimplePeer({
        initiator: true, // Set to `false` on the second device to connect
        trickle: false,
        stream: stream,
      });

      newPeer.on('signal', (data: SignalData) => {
        console.log('Signal data (SDP/ICE):', data);
        // You would copy this signal and pass it manually to the other peer
      });

      newPeer.on('stream', (remoteStream: MediaStream) => {
        setRemoteStream(remoteStream);
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
        }
      });

      setPeer(newPeer);
    }
  }, [stream]);

  const handleSignal = (signalData: string) => {
    if (peer) {
      peer.signal(JSON.parse(signalData));
    }
  };

  useEffect(() => {
console.log('Remote Stream:', remoteStream)
  }, [remoteStream])

  return (
    <div>
      <h1>WebRTC P2P ChatApp</h1>
      <div>
        <video ref={videoRef} autoPlay playsInline muted style={{ width: '300px', height: 'auto' }}></video>
        <video ref={remoteVideoRef} autoPlay playsInline style={{ width: '300px', height: 'auto' }}></video>
      </div>
      <div>
        <textarea placeholder="Paste signaling data here" onChange={(e) => handleSignal(e.target.value)}></textarea>
      </div>
    </div>
  );
};

export default ChatApp;
