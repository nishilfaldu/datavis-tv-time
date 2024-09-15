const fs = require("fs");
const path = require("path");

// Specify the path to the data directory
const dataPath = "../data/frasier_transcripts";

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
    seasonData[seasonFolder] = convertDataFormat(
      aggregateDataInFolder(seasonPath)
    );
  });
  // console.log(seasonData)
  return seasonData;
}

// Function to convert data format
function convertDataFormat(originalData) {
  const nodes = [];
  const links = [];

  // Iterate over each speaker and their connections
  Object.entries(originalData).forEach(([speaker, connections]) => {
    // Add speaker as node if not already added
    if (!nodes.find((node) => node.id === speaker)) {
      if (speaker != "undefined" && speaker.split(" ").length < 2)
        nodes.push({ id: speaker });
    }

    // Count occurrences of connections
    const connectionCounts = {};
    connections.forEach((connection) => {
      if (!connectionCounts[connection]) {
        connectionCounts[connection] = 1;
      } else {
        connectionCounts[connection]++;
      }
    });

    // Add connections as links
    Object.entries(connectionCounts).forEach(([target, value]) => {
      if (
        speaker != "undefined" &&
        target != "undefined" &&
        speaker.split(" ").length < 2 &&
        target.split(" ").length < 2
      ) {
        links.push({ source: speaker, target, value });
      }
    });
  });

  return { nodes, links };
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
      const { speaker, nextSpeaker } = line;
      if (!data[speaker]) {
        data[speaker] = [];
      }
      data[speaker].push(nextSpeaker);
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
const outputFilePath = `../data/conversations_by_season.json`;
writeSeasonDataToFile(seasonData, outputFilePath);
