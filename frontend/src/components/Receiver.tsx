import { useEffect, useRef } from 'react'

function Receiver() {

  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(()=>{
    const socket = new WebSocket('ws://localhost:8080');
    socket.onopen = () => {
      socket.send(JSON.stringify({type: 'receiver'}));
    }

    let pc : RTCPeerConnection | null = null;

    socket.onmessage = async (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'createOffer'){
        //create ans:
        pc = new RTCPeerConnection();
        pc.setRemoteDescription(message.sdp);

        //ice candidates:
        pc.onicecandidate = (e)=>{
          console.log(e);
          if(e.candidate) {
            socket?.send(JSON.stringify({type: 'iceCandidate', candidate: e.candidate}));
          }
        }

        //adding onTrack:
        pc.ontrack = (e) => {
          console.log(e);
          if(videoRef.current){
            videoRef.current.srcObject = new MediaStream([e.track]);
            videoRef.current.play();
          }
        }

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.send(JSON.stringify({type: 'createAnswer', sdp: pc.localDescription}))

      } else if (message.type === 'iceCandidate') {
        pc?.addIceCandidate(message.candidate);
      }
    }
  },[]);

  return (
    <div>
      Receiver
      <video ref={videoRef} autoPlay muted></video>
    </div>
  )
}

export default Receiver
