

// https://www.twitch.tv/popout/karizmi1/chat?popout=
// import tmi from "tmi.js";

export function ttvInit(){
    const tmi = require('tmi.js');

    const client = new tmi.Client({
        channels: [ 'karizmi1' ]
    });

    client.connect();
}

function getMessage() {
    client.on('message', (channel, tags, message, self) => {
        // "Alca: Hello, World!"
        console.log(`${tags['display-name']}: ${message}`);
    });
    return message;}

