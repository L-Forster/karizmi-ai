const textToSpeech = require('@google-cloud/text-to-speech');
async function doTTS(text){
    const fs = require('fs');
    const util = require('util');

    const client = new textToSpeech.TextToSpeechClient();

    const outputFile = 'output.mp3';



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
doTTS();