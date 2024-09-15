const fs = require('fs');
const path = require('path');

const dataPath = 'data/frasier_transcripts';

// Function to read and aggregate data by character
function aggregateDataByCharacter() {
    const characterData = {};

    // Iterate through each season folder
    const seasonFolders = fs.readdirSync(dataPath, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

    seasonFolders.forEach(seasonFolder => {
        const seasonPath = path.join(dataPath, seasonFolder);

        // Iterate through each transcript file
        const transcriptFiles = fs.readdirSync(seasonPath)
            .filter(file => file.endsWith('.json'))
            .map(file => path.join(seasonPath, file));

        transcriptFiles.forEach(transcriptFile => {
            const transcript = JSON.parse(fs.readFileSync(transcriptFile));

            transcript.forEach(line => {
                const { speaker, text } = line;
                if (!characterData[speaker]) {
                    characterData[speaker] = [];
                }
                characterData[speaker].push(text);
            });
        });
    });

    return characterData;
}

// Write aggregated character data to a JSON file
function writeCharacterDataToFile(characterData) {
    const outputFilePath = 'data/character_data_whole_season.json';
    fs.writeFileSync(outputFilePath, JSON.stringify(characterData, null, 2));
    console.log(`Character data has been written to ${outputFilePath}`);
}

// Example usage
const characterData = aggregateDataByCharacter();
// Example usage
writeCharacterDataToFile(characterData);

