const express = require('express');
const fs = require('fs');
const https = require('https');
const bodyParser = require('body-parser')
const app = express();
const port = 9999;

class Message {
  constructor(timestamp, recipient, content, sender) {
    this.timestamp = timestamp;
    this.recipient = recipient
    this.content = content;
    this.sender = sender
  }
}

// Middleware to parse JSON request bodies
app.use(bodyParser.json());

const messages = {}

let nextTimestamp = 1;

const appendMsg = (message) => {
    if (message.recipient in messages)
    {
        messages[message.recipient].push(message)
    }
    else 
    {
        messages[message.recipient] = [ message ]
    }
}

app.get('/messages/:recip', (req, res) => {
    const recip = parseInt(req.params.recip, 10);
    const timestamp = parseInt(req.query.timestamp, 10)

    // Filter messages by ID (for demonstration purposes, assuming ID is part of message content)
    // const filteredMessages = messages.filter(message => message.id === id);

    let result = []

    if (recip in messages) {
        result = messages[recip].filter(m => m.timestamp > timestamp);
        result.sort((a, b) => a.timestamp - b.timestamp);
        messages[recip] = result;
        // we're guaranteed to be able to take out all messages before the current timestamp 
    }

    res.json(result);
});

app.post('/messages', (req, res) => {

    const newMessages = req.body;

    // Validate that newMessages is an array
    if (!Array.isArray(newMessages)) {
        return res.status(400).send('Request body must be an array of messages');
    }

    // Validate and add each message
    const addedMessages = [];
    for (const msg of newMessages) {
        const { recipient, content, sender } = msg;

        // Validate required fields
        if (!content || !recipient) {
            return res.status(400).send('Each message must have content and recipient');
        }

        const newMessage = new Message(nextTimestamp, recipient, content, sender);
        nextTimestamp += 1
        appendMsg(newMessage); 
        addedMessages.push(newMessage);
    }

    res.status(201).json({});
});

// const PRIVKEY = '/etc/'

// Read SSL certificate and key

/*
const options = {
  key: fs.readFileSync('/etc/privkey.pem'),
  cert: fs.readFileSync('/etc/fullchain.pem')
};
*/

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
