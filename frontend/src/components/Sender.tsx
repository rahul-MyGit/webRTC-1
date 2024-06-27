import { useEffect, useState } from 'react'

function Sender() {

  const [socket, setSocket] = useState<null | WebSocket>(null);

  useEffect(()=>{
    const socket = new WebSocket('ws://localhost:8080');
    socket.onopen = () => {
      socket.send(JSON.stringify({type: 'sender'}));
    }
    setSocket(socket);
  },[])

  const startSendingVideo = async () => {
    if (!socket) return;

    const pc = new RTCPeerConnection();
    const offer = await pc.createOffer();  //gives sdp
    await pc.setLocalDescription(offer);

    socket?.send(JSON.stringify({type: 'createOffer', sdp: pc.localDescription}));

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === 'createAnswer'){
        pc.setRemoteDescription(data.sdp);
      }
    }
  }

  return (
    <div>
      Sender
      <button onClick={startSendingVideo}> Send video</button>
    </div>
  )
}

export default Sender
