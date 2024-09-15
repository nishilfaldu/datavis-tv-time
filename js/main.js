function resetSeasonSelection() {
  const selectElement = document.getElementById("season-select");
  const options = selectElement.options;
  for (let i = 0; i < options.length; i++) {
    options[i].selected = i === 0;
  }
  updateCharacterData(".character.selected img", 1, 11);
  updateCharacterData(".character-link", 1, 11);
}
document.addEventListener("DOMContentLoaded", function () {
  const select = document.getElementById("season-select");
  select.addEventListener("change", updateSeasonSelection);
});
document.addEventListener("DOMContentLoaded", function () {
  resetSeasonSelection();
});
function updateSeasonSelection() {
  const select = document.getElementById("season-select");
  const selectedOptions = select.querySelectorAll("option:checked");

  if (selectedOptions.length === 0) {
    console.warn("No seasons selected.");
    return [];
  }
  const selectedSeasons = Array.from(selectedOptions).map((opt) =>
    parseInt(opt.value)
  );
  const minSeason = Math.min(...selectedSeasons);
  const maxSeason = Math.max(...selectedSeasons);

  if (!Number.isInteger(minSeason) || !Number.isInteger(maxSeason)) {
    console.error("Invalid season range:", minSeason, "to", maxSeason);
    return [minSeason, maxSeason];
  }
  updateCharacterData(".character.selected img", minSeason, maxSeason);
  updateCharacterData(".character-link", minSeason, maxSeason);
  return [minSeason, maxSeason];
}
function updateCharacterData(selector, minSeason, maxSeason) {
  const characterElements = document.querySelectorAll(selector);

  characterElements.forEach((characterElement) => {
    const characterName =
      characterElement.alt || characterElement.textContent.split(" ")[0];

    if (characterName) {
      const cd = getCharacterDataForSeasonRange(
        minSeason,
        maxSeason,
        characterName
      );
      renderWordCloud(cd);
      const charData = getPhraseDataForSeasonRange(
        minSeason,
        maxSeason,
        characterName
      );
      renderPhraseCloud(charData);
    } else {
      console.warn("No character selected or incorrect selector used.");
    }
  });
}
document.addEventListener("DOMContentLoaded", function () {
  const characterImages = document.querySelectorAll(".character img");
  characterImages.forEach((image) => {
    image.addEventListener("click", function (event) {
      document.querySelectorAll(".character-link").forEach((link) => {
        link.classList.remove("selected");
      });

      const characterName = event.target.alt;
      const charData = getCharacterDataForSeasonRange(1, 11, characterName);
      renderWordCloud(charData);
      const charData2 = getPhraseDataForSeasonRange(1, 11, characterName);
      renderPhraseCloud(charData2);
      document.querySelectorAll(".character").forEach((character) => {
        character.classList.remove("selected");
      });
      const characterElement = event.target.closest(".character");
      characterElement.classList.add("selected");
    });
  });

  const characterLinks = document.querySelectorAll(".character-link");
  characterLinks.forEach((link) => {
    link.addEventListener("click", function (event) {
      event.preventDefault();
      document.querySelectorAll(".character img").forEach((img) => {
        img.closest(".character").classList.remove("selected");
      });

      const characterName = this.textContent.split(" ")[0];
      const char = getCharacterDataForSeasonRange(1, 11, characterName);
      renderWordCloud(char);
      const char1 = getPhraseDataForSeasonRange(1, 11, characterName);
      renderPhraseCloud(char1);

      document.querySelectorAll(".character-link").forEach((link) => {
        link.classList.remove("selected");
      });
      this.classList.add("selected");
    });
  });
});
document.addEventListener("DOMContentLoaded", function () {
  const resetButton = document.getElementById("reset-button");
  if (resetButton) {
    resetButton.addEventListener("click", resetSeasonSelection);
  }

  const select = document.getElementById("season-select");
  if (select) {
    select.addEventListener("change", updateSeasonSelection);
  }
  resetSeasonSelection();
});

let processedData = {};
let processedPhrases = {};
function cleanText(text) {
  return text
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()'\[\]""?]/g, "") // Extended to include [] ' "
    .replace(/\s{2,}/g, " "); // Collapse multiple spaces to a single space
}

function processDialogues(data) {
  let wordsCount = {};
  const stopwords = [
    "and",
    "the",
    "to",
    "of",
    "a",
    "in",
    "that",
    "it",
    "is",
    "i",
    "you",
    "for",
    "on",
    "with",
    "as",
    "this",
    "by",
    "are",
    "was",
    "be",
    "an",
    "my",
    "your",
    "all",
    "no",
    "he",
    "her",
    "me",
    "them",
    "they",
    "up",
    "do",
    "have",
    "im",
    "at",
    "go",
    "its",
    "if",
    "us",
    "his",
    "ill",
    "so",
    "not",
    "dont",
    "do",
    "ive",
    "yes",
    "am",
    "she",
    "but",
    "we",
    "him",
    "you",
    "your",
    "youre",
    "dr",
    "did",
    "of",
    "off",
    "then",
    "can",
    "our",
    "see",
    "id",
    "has",
    "right",
    "about",
    "what",
    "how",
    "get",
    "like",
    "or",
    "just",
    "well",
    "thats",
    "from",
    "ii",
  ];
  for (let character in data) {
    wordsCount[character] = {};
    for (let season in data[character]) {
      let dialogues = data[character][season].join(" ");
      let words = cleanText(dialogues).split(/\s+/);
      words = words.filter(
        (word) => !stopwords.includes(word) && word.length > 1
      );
      wordsCount[character][season] = words.reduce((acc, word) => {
        acc[word] = (acc[word] || 0) + 1;
        return acc;
      }, {});
    }
  }
  return wordsCount;
}
function getCharacterDataForSeasonRange(
  firstSeason,
  lastSeason,
  characterName
) {
  let allWords = {};
  let totalWordCount = 0;

  // Ensure season inputs are integers
  firstSeason = parseInt(firstSeason);
  lastSeason = parseInt(lastSeason);

  if (firstSeason > lastSeason) {
    console.error("First season cannot be greater than last season");
    return { words: {}, totalWordCount: 0 };
  }
  for (let season = firstSeason; season <= lastSeason; season++) {
    let seasonKey = "season_" + season;

    if (!processedData[seasonKey] || !processedData[seasonKey][characterName]) {
      console.warn(`Data missing for ${characterName} in season ${season}`);
      continue; // Skip this season if data is missing
    }

    let seasonWords = processedData[seasonKey][characterName];
    Object.keys(seasonWords).forEach((word) => {
      allWords[word] = (allWords[word] || 0) + seasonWords[word];
      totalWordCount += seasonWords[word];
    });
  }
  return {
    words: allWords,
    totalWordCount: totalWordCount,
  };
}

function renderWordCloud(characterData) {
  if (!characterData || !Object.keys(characterData.words).length) {
    d3.select("word-cloud-word")
      .append("p")
      .style("text-align", "center")
      .style("margin-top", "50px")
      .text("Select a character to view the word cloud.");
    return;
  }
  let wordsArray = Object.keys(characterData.words)
    .map((word) => ({
      text: word,
      size: characterData.words[word],
      fontSize: characterData.words[word],
    }))
    .sort((a, b) => b.size - a.size)
    .slice(0, 100);
  const width = 500;
  const height = 500;
  const cloudDiv = d3.select("#word-cloud-word");
  const randomColors = [
    "#000000",
    "#36454F",
    "#023020",
    "#301934",
    "#1A1D94",
    "#349cba",
    "#43a29e",
    "#fd88d4",
    "#d5758c",
    "#26711b",
    "#8deca6",
    "#3df62c",
  ];
  randomColors.sort(() => Math.random() - 0.5);
  const colorScale = d3.scaleOrdinal().range(randomColors);
  let minSize = d3.min(wordsArray, (d) => d.fontSize);
  let maxSize = d3.max(wordsArray, (d) => d.fontSize);
  const frequencyScale = d3
    .scaleLinear()
    .domain([minSize, maxSize])
    .range([10, 50]);

  d3.layout
    .cloud()
    .size([width, height])
    .words(wordsArray)
    .padding(10)
    .rotate(0)
    .fontSize((d) => {
      let fsize = frequencyScale(d.fontSize);
      return `${fsize}`;
    })
    .on("end", draw)
    .start();
  function draw(words) {
    const cloudDiv = d3.select("#word-cloud-word");
    cloudDiv.selectAll("*").remove();
    const spans = cloudDiv.selectAll("span").data(
      wordsArray,
      (d) => d.text,
      (d) => d.size
    );
    const wordElements = spans
      .enter()
      .append("span")
      .merge(spans)
      .style("position", "absolute")
      .style("font-size", (d) => {
        const minSize = d3.min(wordsArray, (d) => d.fontSize);
        const maxSize = d3.max(wordsArray, (d) => d.fontSize);
        const frequencyScale = d3
          .scaleLinear()
          .domain([minSize, maxSize])
          .range([10, 50]);
        const fsize = frequencyScale(d.fontSize);
        return `${fsize}px`;
      })
      .style("font-family", "Impact")
      .style(
        "color",
        () => randomColors[Math.floor(Math.random() * randomColors.length)]
      )
      .style(
        "transform",
        (d) =>
          `translate(${d.x + width / 2}px, ${d.y + height / 2}px) rotate(${
            d.rotate
          }deg)`
      )
      .text((d) => d.text)
      .on("mouseover", function (event, d) {
        handleMouseOver.call(this, d.text, d.fontSize);
      })
      .on("mouseleave", handleMouseLeave);

    function handleMouseOver(text, size) {
      const tooltip = d3
        .select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("left", `${event.pageX + 10}px`)
        .style("top", `${event.pageY + 10}px`)
        .style("padding", "5px")
        .style("background-color", "black")
        .style("color", "white")
        .style("border-radius", "8px")
        .style("opacity", 0.9)
        .html(
          `<strong>Word:</strong> ${text}<br><strong>Frequency:</strong> ${size}`
        );
    }

    function handleMouseLeave() {
      d3.select(".tooltip").remove();
    }

    spans.exit().remove();
  }
}
function processPhrases(data) {
  let phraseCount = {};
  for (let character in data) {
    phraseCount[character] = {};
    for (let season in data[character]) {
      let dialogues = data[character][season].join(" ");
      let phrases = extractPhrases(dialogues);
      phraseCount[character][season] = phrases.reduce((acc, phrase) => {
        acc[phrase] = (acc[phrase] || 0) + 1;
        return acc;
      }, {});
    }
  }
  return phraseCount;
}
function extractPhrases(text) {
  return text
    .replace(/[\r\n]+/g, " ")
    .split(/(?<=[.?!])\s+/)
    .map((phrase) =>
      phrase
        .replace(/[^\w\s]|_/g, "")
        .trim()
        .toLowerCase()
    )
    .filter((phrase) => {
      const wordCount = phrase.split(/\s+/).length;
      return wordCount >= 2 && wordCount <= 5;
    });
}
function getPhraseDataForSeasonRange(firstSeason, lastSeason, characterName) {
  let allPhrases = {};
  let totalPhraseCount = 0;

  firstSeason = parseInt(firstSeason);
  lastSeason = parseInt(lastSeason);

  if (firstSeason > lastSeason) {
    console.error("Invalid season range:", firstSeason, "to", lastSeason);
    return null;
  }

  for (let season = firstSeason; season <= lastSeason; season++) {
    let seasonKey = `season_${season}`;

    if (
      !processedPhrases[seasonKey] ||
      !processedPhrases[seasonKey][characterName]
    ) {
      console.error(
        `No data available for season ${season} and character ${characterName}.`
      );
      continue;
    }

    let seasonPhrases = processedPhrases[seasonKey][characterName];
    Object.keys(seasonPhrases).forEach((phrase) => {
      if (allPhrases.hasOwnProperty(phrase)) {
        allPhrases[phrase] += seasonPhrases[phrase];
      } else {
        allPhrases[phrase] = seasonPhrases[phrase];
      }
      totalPhraseCount += seasonPhrases[phrase];
    });
  }

  return {
    phrases: allPhrases,
    totalPhraseCount: totalPhraseCount,
  };
}
function renderPhraseCloud(phraseData) {
  if (!phraseData || !Object.keys(phraseData.phrases).length) {
    console.log("No data to render.");
    return;
  }

  let phrasesArray = Object.keys(phraseData.phrases)
    .map((phrase) => ({
      text: phrase,
      size: phraseData.phrases[phrase],
      fontSize: phraseData.phrases[phrase],
    }))
    .sort((a, b) => b.size - a.size)
    .slice(0, 100);
  const randomColors = [
    "#000000",
    "#36454F",
    "#023020",
    "#301934",
    "#1A1D94",
    "#349cba",
    "#43a29e",
    "#fd88d4",
    "#d5758c",
    "#26711b",
    "#8deca6",
    "#3df62c",
  ];
  const colorScale = d3.scaleOrdinal(randomColors);

  let minSize = d3.min(phrasesArray, (d) => d.fontSize);
  let maxSize = d3.max(phrasesArray, (d) => d.fontSize);
  const frequencyScale = d3
    .scaleLinear()
    .domain([minSize, maxSize])
    .range([10, 50]);
  const width = 500;
  const height = 500;
  if (!d3.layout || !d3.layout.cloud) {
    console.error(
      "d3.layout.cloud is not available - make sure to load the required library."
    );
    return;
  }
  const layout = d3.layout
    .cloud()
    .size([width, height])
    .words(phrasesArray)
    .padding(10)
    .rotate(0)
    .fontSize((d) => frequencyScale(d.fontSize))
    .on("end", draw);
  layout.start();
  function draw(words) {
    const cloudDiv = d3.select("#word-cloud-phrase");
    cloudDiv.selectAll("span").remove();

    cloudDiv
      .selectAll("span")
      .data(words)
      .enter()
      .append("span")
      .style("position", "absolute")
      .style("font-size", (d) => `${frequencyScale(d.fontSize)}px`)
      .style("font-family", "Impact")
      .style("color", (d) => colorScale(d.text))
      .style(
        "transform",
        (d) =>
          `translate(${d.x + width / 2}px, ${d.y + height / 2}px) rotate(${
            d.rotate
          }deg)`
      )
      .text((d) => d.text)
      .on("mouseover", function (event, d) {
        const tooltip = d3
          .select("body")
          .append("div")
          .attr("class", "tooltip")
          .style("position", "absolute")
          .style("left", `${event.pageX + 10}px`)
          .style("top", `${event.pageY + 10}px`)
          .style("padding", "5px")
          .style("background-color", "black")
          .style("color", "white")
          .style("border-radius", "8px")
          .style("opacity", 0.9)
          .html(
            `<strong>Word:</strong> ${d.text}<br><strong>Frequency:</strong> ${d.size}`
          );
      })
      .on("mouseleave", () => {
        d3.select(".tooltip").remove();
      });
  }
}
const characterImages = document.querySelectorAll(".character img");

let characterBox = [
  "Frasier_appearances",
  "Daphne_appearances",
  "Niles_appearances",
  "Roz_appearances",
  "Martin_appearances",
  "Eddie_appearances",
  "Bulldog_appearances",
];

let appearanceList = {
  Frasier: {},
  Daphne: {},
  Niles: {},
  Roz: {},
  Martin: {},
  Eddie: {},
  Bulldog: {},
};
function handleCharacterClick(event) {
  const characterName = event.target.alt;
  const char = getCharacterDataForSeasonRange(1, 11, characterName);
  renderWordCloud(char);
  const char1 = getPhraseDataForSeasonRange(1, 11, characterName);
  renderPhraseCloud(char1);
  document.querySelectorAll(".character").forEach((character) => {
    character.classList.remove("selected");
  });
  const characterElement = event.target.closest(".character");
  characterElement.classList.add("selected");
  let characterAppearance = characterName + "_appearances";
  let dropDownTitle = characterName + "'s List of Appearances";
  let dropdownTitleElement = document.getElementById("dropdown_title");
  if (dropdownTitleElement) {
    dropdownTitleElement.textContent = dropDownTitle;
  } else {
    console.log("Error: Dropdown title element not found.");
  }
  let selectBox = document.getElementById(characterAppearance);
  if (selectBox) {
    if (selectBox.style.display === "flex") {
      selectBox.setAttribute("style", "display: none;");
    } else {
      selectBox.setAttribute("style", "display: flex;");
    }
  } else {
    console.error("Element with ID '" + characterAppearance + "' not found.");
  }
  for (let i = 0; i < characterBox.length; i++) {
    if (characterBox[i] != characterAppearance) {
      document.getElementById(characterBox[i]).style.display = "none";
    }
  }
  let counter = 0;
  for (let i = 0; i < characterBox.length; i++) {
    if (document.getElementById(characterBox[i]).style.display == "none") {
      counter += 1;
    }
  }
  if (counter == characterBox.length) {
    document.getElementById("character_appearances").style.display = "none";
  } else
    document.getElementById("character_appearances").style.display = "flex";
}
characterImages.forEach((image) => {
  image.addEventListener("click", handleCharacterClick);
});
d3.json("data/frasier_transcripts/character_data_whole_season.json")
  .then(function (data) {
    const barchart = new Barchart({ parentElement: "#barchart" }, data);
  })
  .catch(function (error) {
    console.error("Error loading the JSON file:", error);
  });

d3.json("data/frasier_transcripts/characters_by_episode.json")
  .then(function (data) {
    for (let season in data) {
      for (let episode in data[season]) {
        for (let character in data[season][episode]) {
          if (character in appearanceList) {
            if (!(season in appearanceList[character])) {
              appearanceList[character][season] = {};
            }
            if (!(episode in appearanceList[character][season])) {
              appearanceList[character][season][episode] = {};
            }
            appearanceList[character][season][episode] =
              data[season][episode][character].length;
          }
        }
      }
    }
    for (let character in appearanceList) {
      let characterName = character + "_appearances";
      let selectBox = document.getElementById(characterName);
      let seasonsNames = "";
      let sig10 = false;
      let sig11 = false;
      for (let season in appearanceList[character]) {
        if (season == "season_10") {
          sig10 = true;
        } else if (season == "season_11") {
          sig11 = true;
        } else {
          let seasonName = season.split("_");
          seasonName[0] =
            seasonName[0].charAt(0).toUpperCase() + seasonName[0].slice(1);
          for (let word in seasonName) {
            seasonsNames = seasonsNames + seasonName[word] + " ";
          }
          seasonsNames = seasonsNames.slice(0, -1);
          seasonsNames = seasonsNames + ",";
        }
      }
      if (sig10) {
        seasonsNames = seasonsNames + "Season 10,";
      }
      if (sig11) {
        seasonsNames = seasonsNames + "Season 11,";
      }
      seasonsNames = seasonsNames.slice(0, -1);
      seasonsNames = seasonsNames.split(",");

      function sortEpisodes(obj) {
        function customSort(a, b) {
          let numA = parseInt(a.split("_")[1]);
          let numB = parseInt(b.split("_")[1]);
          return numA - numB;
        }
        let sortedKeys = Object.keys(obj).sort(customSort);
        let sortedObj = {};
        sortedKeys.forEach(function (key) {
          sortedObj[key] = obj[key];
        });
        return sortedObj;
      }
      for (let character in appearanceList) {
        for (let season in appearanceList[character]) {
          appearanceList[character][season] = sortEpisodes(
            appearanceList[character][season]
          );
        }
      }
      let table = document.createElement("table");
      table.style.borderCollapse = "collapse";
      let headerRow = document.createElement("tr");
      seasonsNames.forEach(function (season) {
        let seasonHeaderCell = document.createElement("th");
        seasonHeaderCell.textContent = season;
        seasonHeaderCell.colSpan = 2;
        seasonHeaderCell.style.border = "1px solid black";
        headerRow.appendChild(seasonHeaderCell);
      });
      table.appendChild(headerRow);
      let subheaderRow = document.createElement("tr");
      seasonsNames.forEach(function (season) {
        let episodeNameHeaderCell = document.createElement("th");
        episodeNameHeaderCell.textContent = "Episode Name";
        episodeNameHeaderCell.style.border = "1px solid black";
        subheaderRow.appendChild(episodeNameHeaderCell);
        let episodeLengthHeaderCell = document.createElement("th");
        episodeLengthHeaderCell.textContent = "Length";
        episodeLengthHeaderCell.style.border = "1px solid black";
        subheaderRow.appendChild(episodeLengthHeaderCell);
      });
      table.appendChild(subheaderRow);
      let numSeasons = Object.keys(appearanceList[character]).length;
      let maxEpisodes = 0;
      let numEpisodes = [];
      for (let season in appearanceList[character]) {
        if (
          maxEpisodes < Object.keys(appearanceList[character][season]).length
        ) {
          maxEpisodes = Object.keys(appearanceList[character][season]).length;
        }
        numEpisodes.push(Object.keys(appearanceList[character][season]).length);
      }
      for (let j = 0; j < maxEpisodes; j++) {
        let row = document.createElement("tr");
        for (let i = 0; i < numSeasons; i++) {
          if (j < numEpisodes[i]) {
            let numLines =
              appearanceList[character][
                Object.keys(appearanceList[character])[i]
              ][
                Object.keys(
                  appearanceList[character][
                    Object.keys(appearanceList[character])[i]
                  ]
                )[j]
              ];
            let episodeName = Object.keys(
              appearanceList[character][
                Object.keys(appearanceList[character])[i]
              ]
            )[j];
            let episodeNameCell = document.createElement("td");
            episodeNameCell.textContent = episodeName.replace(/_/g, " ");
            episodeNameCell.style.border = "1px solid black"; // Add border
            row.appendChild(episodeNameCell);
            let episodeLengthCell = document.createElement("td");
            episodeLengthCell.textContent = numLines + " lines";
            episodeLengthCell.style.border = "1px solid black"; // Add border
            row.appendChild(episodeLengthCell);
          } else {
            let episodeNameCell = document.createElement("td");
            episodeNameCell.textContent = null;
            episodeNameCell.style.border = "1px solid black"; // Add border
            row.appendChild(episodeNameCell);
            let episodeLengthCell = document.createElement("td");
            episodeLengthCell.textContent = null;
            episodeLengthCell.style.border = "1px solid black"; // Add border
            row.appendChild(episodeLengthCell);
          }
        }
        table.appendChild(row);
      }
      selectBox.appendChild(table);
    }
  })
  .catch(function (error) {
    console.error("Error loading the JSON file:", error);
  });

characterImages.forEach((image) => {
  image.addEventListener("click", handleCharacterClick);
});
d3.json("data/frasier_transcripts/character_data_whole_season.json")
  .then(function (data) {
    const barchart = new Barchart({ parentElement: "#barchart" }, data);
  })
  .catch(function (error) {
    console.error("Error loading the JSON file:", error);
  });

document.addEventListener("DOMContentLoaded", function () {
  d3.json("data/frasier_transcripts/characters_by_season.json")
    .then(function (data) {
      processedData = processDialogues(data);
      processedPhrases = processPhrases(data);
      console.log("processed: ", processedPhrases);
      const barchart = new StackedBarchart(
        { parentElement: "#stacked-barchart" },
        data
      );
    })
    .catch(function (error) {
      console.error("Error loading the JSON file:", error);
    });
});

d3.json("data/frasier_transcripts/full_conversation_data.json")
  .then(function (data) {
    const conversationHistogram = new WordLengthHisto(
      { parentElement: "#word-length-histo" },
      data
    );
  })
  .catch(function (error) {
    console.error("Error loading the JSON file:", error);
  });

d3.json("data/frasier_transcripts/conversations_by_season.json")
  .then(function (data) {
    const conversationArc = new ArcDiagram(
      {
        parentElement: "#conversation-arc",
        width: 900,
        step: 14,
        marginTop: 20,
        marginRight: 20,
        marginBottom: 20,
        marginLeft: 130,
      },
      data[document.getElementById("arc-dropdown").value]
    );
  })
  .catch(function (error) {
    console.error("Error loading the JSON file:", error);
  });

// // let selectSeason = document.getElementById("arc-dropdown");
// // selectSeason.addEventListener("change", function () {
// //   let selectedSeason = selectSeason.options[selectSeason.selectedIndex];
// //   let selectedValue = selectedSeason.value;

// //   d3.json("data/frasier_transcripts/conversations_by_season.json")
// //     .then(function (data) {
// //       const conversationArc = new ArcDiagram(
// //         {
// //           parentElement: "#conversation-arc",
// //           width: 640,
// //           step: 14,
// //           marginTop: 20,
// //           marginRight: 20,
// //           marginBottom: 20,
// //           marginLeft: 130,
// //         },
// //         data[document.getElementById("arc-dropdown").value]
// //       );
// //     })
// //     .catch(function (error) {
// //       console.error("Error loading the JSON file:", error);
// //     });
// });
let selectSeason = document.getElementById("arc-dropdown");
selectSeason.addEventListener("change", function () {
  // Get the selected season value
  let selectedValue = selectSeason.value;

  // Clear existing SVG content
  const svgContainer = document.getElementById("conversation-arc");
  svgContainer.innerHTML = "";

  // Load the JSON data for the selected season
  d3.json("data/frasier_transcripts/conversations_by_season.json")
    .then(function (data) {
      // Check if data for the selected season is available
      if (data[selectedValue]) {
        // Create a new instance of ArcDiagram
        const conversationArc = new ArcDiagram(
          {
            parentElement: "#conversation-arc",
            width: 900,
            step: 14,
            marginTop: 20,
            marginRight: 20,
            marginBottom: 20,
            marginLeft: 130,
          },
          data[selectedValue]
        );
      } else {
        console.error("No data available for the selected season");
      }
    })
    .catch(function (error) {
      console.error("Error loading the JSON file:", error);
    });
});
