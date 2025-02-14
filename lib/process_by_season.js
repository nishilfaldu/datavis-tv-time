const fs = require("fs");
const path = require("path");

// Specify the path to the data directory
const dataPath = "data/frasier_transcripts";

// Function to aggregate data by season
function aggregateDataBySeason(dataPath) {
  const seasonData = {};

  // Iterate through each season folder
  const seasonFolders = fs
    .readdirSync(dataPath, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);
  console.log(seasonFolders);

  seasonFolders.forEach((seasonFolder) => {
    const seasonPath = path.join(dataPath, seasonFolder);
    seasonData[seasonFolder] = aggregateDataInFolder(seasonPath);
  });
  // console.log(seasonData)
  return seasonData;
}

// Function to aggregate data in a specific folder
function aggregateDataInFolder(folderPath) {
  const data = {};

  // Iterate through each transcript file
  const transcriptFiles = fs
    .readdirSync(folderPath)
    .filter((file) => file.endsWith(".json"))
    .map((file) => path.join(folderPath, file));

  console.log(transcriptFiles);

  transcriptFiles.forEach((transcriptFile) => {
    const transcript = JSON.parse(fs.readFileSync(transcriptFile));

    transcript.forEach((line) => {
      const { speaker, text } = line;
      if (!data[speaker]) {
        data[speaker] = [];
      }
      data[speaker].push(text);
    });
  });

  return data;
}

// Function to write aggregated data by season to a JSON file
function writeSeasonDataToFile(seasonData, outputFilePath) {
  fs.writeFileSync(outputFilePath, JSON.stringify(seasonData, null, 2));
  console.log(`Season data has been written to ${outputFilePath}`);
}

// Example usage
const seasonData = aggregateDataBySeason(dataPath);
const outputFilePath = `data/characters_by_season.json`;
writeSeasonDataToFile(seasonData, outputFilePath);
