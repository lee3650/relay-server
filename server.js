const WebSocket = require('ws');
const server = new WebSocket.Server({ port: 8080 });

let clients = {};

server.on('connection', (ws) => {
    ws.on('message', (message) => {
        let data = JSON.parse(message);
        if (data.type === 'register') {
            console.log(`registering client: ${data.payload}`); 
            clients[data.payload] = ws;
        } else if (data.type === 'forward') {
            console.log(`forwarding message with target: ${data.targetId}, payload: ${data.payload}`)
            let targetClient = clients[data.targetId];
            if (targetClient) {
                targetClient.send(JSON.stringify(data.payload));
            }
        }
    });

    ws.on('close', () => {
        // Remove the client from the list when they disconnect
        for (let clientId in clients) {
            if (clients[clientId] === ws) {
                delete clients[clientId];
                break;
            }
        }
    });
});

console.log('Server running on port 8080');
