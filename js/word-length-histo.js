class WordLengthHisto{
    constructor(_config, _data){
        this.config = {
            parentElement: _config.parentElement,
            containerWidth: _config.containerWidth || 650,
            containerHeight: _config.containerHeight || 500,
            margin: _config.margin || {top: 25, right: 20, bottom: 50, left: 100},
        }
        this.data = _data;
        this.initVis();

        this.tooltip = d3
            .select('body')
            .append('div')
            .attr('class', 'd3-tooltip')
            .style('position', 'absolute')
            .style('z-index', '10')
            .style('visibility', 'hidden')
            .style('padding', '10px')
            .style('background', 'rgba(0,0,0,0.6)')
            .style('border-radius', '4px')
            .style('color', '#fff')
            .text('a simple tooltip');

        d3.selectAll(".histo-character-dropdown").on("change", (event) => this.updateVis());
    }

    initVis(){
        let vis = this;
        
        vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
        vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

        vis.svg = d3.select(vis.config.parentElement)
          .attr('width', vis.config.containerWidth)
          .attr('height', vis.config.containerHeight);

        vis.chart = vis.svg.append('g')
          .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);

        vis.xScale = d3.scaleLinear()
            .range([0,vis.width]);
        
        vis.yScale = d3.scaleLinear()
            .range([vis.height, 0]);

        // Append empty x-axis group and move it to the bottom of the chart
        vis.xAxis = d3.axisBottom(vis.xScale);
        vis.xAxisG = vis.chart.append('g')
            .attr('transform', `translate(0,${vis.height})`);
        
        // Append y-axis group 
        vis.yAxis = d3.axisLeft(vis.yScale);
        vis.yAxisG = vis.chart.append('g')
            .attr('class', 'axis y-axis');
        
        vis.updateVis();
    }

    updateVis(){
        let vis = this;

        vis.characterA = d3.select('#histoCharacterA').node().value;
        vis.characterB = d3.select('#histoCharacterB').node().value;

        vis.characterAData = [];
        vis.characterBData = [];
        for(let i = 0; i < vis.data.length; i++){
            if(vis.data[i].speaker == vis.characterA && (vis.data[i].prevSpeaker == vis.characterB || vis.data[i].nextSpeaker == vis.characterB)){
                vis.characterAData = vis.characterAData.concat(vis.data[i].text.replace(/ *_[^)]*_ */g, "").replace(/[.,\/#!$%\^&\*;:{}=\_`~()"?]/g," ").replaceAll('-',' ').split(" ").filter(function(i){return i}).filter(function(i){return !i.includes('html')}));
            }
        }

        if(vis.characterAData.length == 0)
            alert("No data available for selected characters.")

        vis.xScale.domain([1, d3.max(vis.characterAData, function(d){ return d.length; })]);

        vis.xAxisG.call(vis.xAxis);

        vis.histogram = d3.histogram()
            .value(function(d){ return d.length; })
            .domain(vis.xScale.domain())
            .thresholds(vis.xScale.ticks(10));

        vis.binsA = vis.histogram(vis.characterAData);

        vis.yScale.domain([0, d3.max(vis.binsA, function(d){ return d.length; })]);
        vis.yAxisG.call(vis.yAxis);
        vis.renderVis();
    }

    renderVis(){
        let vis = this;

        vis.bars = vis.chart.selectAll("rect")
            .data(vis.binsA)
            .join("rect")
                .attr("x", 1)
                .attr("transform", function(d) { return "translate(" + vis.xScale(d.x0) + "," + vis.yScale(d.length) + ")"; })
                .attr("width", function(d) { return vis.xScale(d.x1) - vis.xScale(d.x0) -1 ; })
                .attr("height", function(d) { return vis.height - vis.yScale(d.length); })
                .style("fill", "#69b3a2")
                .style("opacity", 0.6)
                .on("mouseover", function(event, d){
                    vis.tooltip.style("visibility","visible")
                        .html(
                            "<strong>" + d.length + "</strong> words between " + d.x0 + " and " + (d.x1 - 1) + " letters long."
                        )
                        .style("top", event.pageY - 10 + "px")
                        .style("left", event.pageX + 10 + "px");
                })
                .on("mousemove", function(event){
                    vis.tooltip.style("top", event.pageY - 10 + "px").style("left", event.pageX + 10 + "px");
                })
                .on("mouseout", function() {      
                  vis.tooltip.style("visibility", "hidden");
                });
    }
}