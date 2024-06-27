import { WebSocketServer } from "ws";

const wss = new WebSocketServer({port: 3000});

let senderSocker :null | WebSocket = null;
let receiverSocker :null | WebSocket = null;

wss.on('connection', function connection(ws){
    ws.on('error', console.error);

    ws.on('message', function message(data: any){
        
        const message = JSON.parse(data);
        // create offer
        // create ans
        // create ice candidates
    });

    ws.send('someting');
});

