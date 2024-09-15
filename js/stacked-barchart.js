const colorScaleForShapes_ = ["#FF0000","#FF3300","#FF6600","#FF9900","#FFCC00","#FFFF00","#CCFF00","#99FF00","#66FF00","#33FF00","#00FF00","#00FF33","#00FF66","#00FF99","#00FFCC","#00FFFF","#00CCFF","#0099FF","#0066FF","#0033FF","#0000FF","#3300FF","#6600FF","#9900FF","#CC00FF","#FF00FF","#FF00CC","#FF0099","#FF0066","#FF0033"];

class StackedBarchart {

    /**
     * Class constructor with basic chart configuration
     * @param {Object}
     * @param {Array}
     */
    constructor(_config, _data) {
      // Configuration object with defaults
      this.config = {
        parentElement: _config.parentElement,
        colorScale: _config.colorScale,
        containerWidth: _config.containerWidth || 650,
        containerHeight: _config.containerHeight || 250,
        margin: _config.margin || {top: 25, right: 20, bottom: 50, left: 100},
      }
      this.data = _data;
      this.colorScale = colorScaleForShapes_;
      
      this.initVis(); 
    }
    
    /**
     * Initialize scales/axes and append static elements, such as axis titles
     */
    initVis() {
      let vis = this;
  
      // Calculate inner chart size. Margin specifies the space around the actual chart.
      vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
      vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;
  
      // Initialize scales and axes
      vis.subgroups = Object.keys(vis.data)
      // console.log(vis.subgroups, "subgroups")

      vis.selectedCharacters = [
        "Frasier",
        "Niles",
        "Martin",
        "Daphne",
        "Roz",
        "Bulldog",
        "Lilith",
        "Kenny",
        "Bebe",
        "Donny"
    ]
      vis.transformedData = vis.transformData(vis.data)
        // console.log(vis.transformedData, "transformed data")
        vis.groups = d3.map(vis.transformedData, function(d){return(d.group)})
      // console.log(vis.groups, "groups")
  
    //   // Define size of SVG drawing area
      vis.svg = d3.select(vis.config.parentElement)
          .attr('width', vis.config.containerWidth)
          .attr('height', vis.config.containerHeight);
  
    //   // SVG Group containing the actual chart; D3 margin convention
      vis.chart = vis.svg.append('g')
          .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);
        
    var x = d3.scaleBand()
      .domain(vis.groups)
      .range([0, vis.width])
      .padding([0.2])
  vis.chart.append("g")
    .attr("transform", "translate(0," + vis.height + ")")
    .call(d3.axisBottom(x).tickSizeOuter(0));

  // Add Y axis
  var y = d3.scaleLinear()
    .domain([0, 25000])
    .range([ vis.height, 0 ]);
  vis.chart.append("g")
    .call(d3.axisLeft(y));

  // color palette = one color per subgroup
  var color = d3.scaleOrdinal()
    .domain(vis.subgroups)
    .range(d3.schemeSet2);

  //stack the data? --> stack per subgroup
  var stackedData = d3.stack()
    .keys(vis.subgroups)
    (vis.transformedData)




  // ----------------
  // Highlight a specific subgroup when hovered
  // ----------------

  // What happens when user hover a bar
//   var mouseover = 

  // When user do not hover anymore
  var mouseleave = function(d) {
    // Back to normal opacity: 0.8
    d3.selectAll(".myRect")
      .style("opacity",0.8)
    }

  // Show the bars
  vis.chart.append("g")
    .selectAll("g")
    // Enter in the stack data = loop key per key = group per group
    .data(stackedData)
    .enter().append("g")
      .attr("fill", function(d) { return color(d.key); })
      .attr("class", function(d){ return "myRect " + d.key }) // Add a class to each subgroup: their name
      .selectAll("rect")
      // enter a second time = loop subgroup per subgroup to add all rectangles
      .data(function(d) { return d; })
      .enter().append("rect")
        .attr("x", function(d) { return x(d.data.group); })
        .attr("y", function(d) { return y(d[1]); })
        .attr("height", function(d) { return y(d[0]) - y(d[1]); })
        .attr("width",x.bandwidth())
        .attr("stroke", "grey")
      .on("mouseover", function(d) {
        // console.log(d3.select(this.parentNode).datum(), "this.parentNode")
        // what subgroup are we hovering?
        var subgroupName = d3.select(this.parentNode).datum().key;
        // Reduce opacity of all rect to 0.2
        d3.selectAll(".myRect").style("opacity", 0.2)
        // Highlight all rects of this subgroup with opacity 0.8. It is possible to select them since they have a specific class = their name.
        d3.selectAll("."+subgroupName)
          .style("opacity", 1)
        })
      .on("mouseleave", mouseleave)
    }

        // Function to transform the data
    transformData(characterData) {
        let vis = this;
        const transformedData = [];

    // Iterate through each character
    vis.selectedCharacters.forEach((character) => {
        // Initialize an object with the group (character name)
        const characterObj = { group: character };

        // Count the number of dialogues for each season and add to the character object
        Object.entries(characterData).forEach(([season, characters]) => {
            if (characters[character]) {
                characterObj[season] = characters[character].length;
            } else {
                characterObj[season] = 0;
            }
        });

        // Push the character object to the transformedData array
        transformedData.push(characterObj);
    });

    return transformedData;
    }
  }