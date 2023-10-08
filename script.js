const textToSpeech = require('@google-cloud/text-to-speech');
const axios = require('axios');
var player = require('play-sound')(opts = {})
const { getAudioDurationInSeconds } = require('get-audio-duration')
const getMP3Duration = require('get-mp3-duration')
var responded = false;
let msg = "";
var memory= [];
let interval = 20000;
async function generateResponse(inputText, memory) {
    try {
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: 'gpt-3.5-turbo',
            messages: [
                { role: 'system', content: 'You are not a language model, You are a female Twitch streamer who streams Just Chatting Category. Respond as if you are responding to a specific twitch chat message.' +
                        'Make the responses in a way a streamer would speak. ' +
                        'Respond in English. ' +
                        'You must act with the following personality attributes:' +
                        'ATTRIBUTE A: 9/10' +
                        'ATTRIBUTE B: 7/10' +
                        'ATTRIBUTE C: 8/10' +
                        'ATTRIBUTE D: 10/10' +
                        'ATTRIBUTE E: 10/10' +
                        'ATTRIBUTE F: 10/10' +
                        'This is your message history (use it to add context to your responses): ' + memory },
                { role: 'user', content: inputText }
            ]
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer OPENAI_API_KEY'
            }
        });

        // Extract the model's reply from the API response
        const modelReply = response.data.choices[0].message.content;

        return modelReply;
    } catch (error) {
        console.error('Error generating chat response:', error);
        throw error;
    }
}



const tmi = require('tmi.js');
const util = require("util");
const fs = require("fs");

const client = new tmi.Client({
    channels: [ 'karizmi1' ]
});

client.connect();
function getChatMessage(client, callback) {
    const messageHandler = (channel, tags, message, self) => {
        client.off('message', messageHandler); // Remove the event listener
        msg = `${tags['display-name']}: ${message}`;
        callback(msg);
        memory.push("Viewer's Message: " + message);
        while (memory.length > 20){ memory.shift();}

    };
    client.on('message', messageHandler);
}


function getMessage(client, text) {
    longText = "";
    if (text == "joke"){
        longText = "Come up with an edgy random joke";
    }
    else if (text == "story"){
        longText = "Make up a random interesting story that";
    }
    else if (text == "insult"){
        longText = "Jokingly criticize a specific named twitch streamer. Replace 'insert streamer name' with an actual username";
    }
    else if (text == "beg"){
        longText = "Ask for donations";
    }
    else if (text == "ask"){
        longText = "Ask chat a question";
    }
    let t = generateResponse(longText, memory);
    t.then((response) => {
        console.log('Model reply:', response);
        doTTS(response, text);
        memory.push("You said: " + response);
        while (memory.length > 20){ memory.shift();}

    })
        .catch((error) => {
            console.log('Error:', error);
        });

}
async function doTTS(text, name){
    const fs = require('fs');
    const util = require('util');

    const client = new textToSpeech.TextToSpeechClient();

    const outputFile = name + '.mp3';



    const request = {
        input: {text: text},
        voice: {languageCode: 'en-US', name: 'en-US-Neural2-H', ssmlGender: 'FEMALE'},
        audioConfig: {audioEncoding: 'MP3'},
    };
    const [response] = await client.synthesizeSpeech(request);
    const writeFile = util.promisify(fs.writeFile);
    await writeFile(outputFile, response.audioContent, 'binary');
    console.log(`Audio content written to file: ${outputFile}`);
}

// doTTS(generateJoke().then(),"JokeTTS");
// generateStory();



    function playAudio(filePath) {
        player.play(filePath, (error) => {
            if (error) {
                console.error('Error playing audio:', error);
            }
        });
    }



// main sequence

async function main(msg) {
    console.log(memory);
    let num  = Math.random();
    console.log(num);
    if (num >= 0.25) {
        try {
            if (!responded) {
                await getChatMessage(client, (message) => {
                    console.log('Received message:', message);
                    console.log(msg);
                    generateResponse(message, memory)
                        .then((response) => {
                            console.log('Model reply:', response);
                            doTTS(response, "response");
                            responded = false;
                            memory.push("Your Response: " + response);

                        })
                        .catch((error) => {
                            console.error('Error:', error);
                            responded = true;
                        });

                });
            }
            if (!responded) {
                clearInterval(intervalid);
                const buffer = fs.readFileSync('./response.mp3')
                const duration = getMP3Duration(buffer)
                intervalid = setInterval(main, duration + 5000);
                console.log(interval);
                playAudio("./response.mp3")
                responded = true;
            }

        } catch (error) {
            console.log("Input Rejected");
        }
    }
    else if (num < 0.025) {
        getMessage(client, "beg");
        playAudio("./beg.mp3")
        clearInterval(intervalid);
        const buffer = fs.readFileSync('./beg.mp3')
        const duration = getMP3Duration(buffer)
        intervalid = setInterval(main, duration + 5000);
    }
    else if (num < 0.05) {
        getMessage(client, "insult");
        playAudio("./insult.mp3")
        clearInterval(intervalid);
        const buffer = fs.readFileSync('./insult.mp3')
        const duration = getMP3Duration(buffer)
        intervalid = setInterval(main, duration + 5000);
    }

    else if (num < 0.125) {
        getMessage(client, "joke");
        playAudio("./joke.mp3")
        const buffer = fs.readFileSync('./joke.mp3')
        const duration = getMP3Duration(buffer)
        clearInterval(intervalid);
        intervalid = setInterval(main, duration + 5000);
    }
    else if (num < 0.15){
        getMessage(client, "story");
        playAudio("./story.mp3");
        const buffer = fs.readFileSync('./story.mp3')
        const duration = getMP3Duration(buffer)
        clearInterval(intervalid);
        intervalid = setInterval(main, duration + 5000);
    }

    else if (num < 0.25){
        getMessage(client, "ask");
        playAudio("./ask.mp3");
        const buffer = fs.readFileSync('./ask.mp3')
        const duration = getMP3Duration(buffer)
        clearInterval(intervalid);
        intervalid = setInterval(main, duration + 5000);
    }
}

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}
let intervalid = setInterval(main,20000);
