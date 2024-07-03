import { useEffect, useState } from 'react'

function Sender() {

  const [socket, setSocket] = useState<null | WebSocket>(null);

  useEffect(()=>{
    const socket = new WebSocket('ws://localhost:8080');
    socket.onopen = () => {
      socket.send(JSON.stringify({type: 'sender'}));
    }
    setSocket(socket);
  },[]);

  const startSendingVideo = async () => {
    if (!socket) return;

    const pc = new RTCPeerConnection();
    pc.onnegotiationneeded = async () => {
      console.log("onnegotiationneeded");
      const offer = await pc.createOffer();  //gives sdp
      await pc.setLocalDescription(offer);
    socket?.send(JSON.stringify({type: 'createOffer', sdp: pc.localDescription}));
    }
    

    pc.onicecandidate = (e)=>{
      console.log(e);
      if(e.candidate) {
        socket?.send(JSON.stringify({type: 'iceCandidate', candidate: e.candidate}));
      }
    }


    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === 'createAnswer'){
        pc.setRemoteDescription(data.sdp);
      } else if(data.type === "iceCandidate"){    //trickle ice : as ice candidates are slowly trickling it
        pc.addIceCandidate(data.candidate);
      }

    }

    const stream = await navigator.mediaDevices.getUserMedia({video: true, audio: false});
    pc.addTrack(stream.getVideoTracks()[0]);
  }

  return (
    <div>
      Sender
      <button onClick={startSendingVideo}> Send video</button>
    </div>
  )
}

export default Sender
