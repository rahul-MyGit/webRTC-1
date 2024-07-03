import { useEffect } from 'react'

function Receiver() {

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
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        //ice candidates:
        pc.onicecandidate = (e)=>{
          console.log(e);
          if(e.candidate) {
            socket?.send(JSON.stringify({type: 'iceCandidate', candidate: e.candidate}));
          }
        }

        socket.send(JSON.stringify({type: 'createAnswer', sdp: pc.localDescription}))
      } else if (message.type === 'iceCandidate') {
        pc?.addIceCandidate(message.candidate);
      }
    }
  },[]);

  return (
    <div>
      Receiver
    </div>
  )
}

export default Receiver
