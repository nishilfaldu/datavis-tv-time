class ArcDiagram {
  constructor(_config, _data) {
    this.config = {
      parentElement: _config.parentElement,
      width: _config.width || 640,
      step: _config.step || 14,
      marginTop: _config.marginTop || 20,
      marginRight: _config.marginRight || 20,
      marginBottom: _config.marginBottom || 20,
      marginLeft: _config.marginLeft || 130,
    };

    // Ensure all nodes are present in the nodes array
    let nodeIds = new Set(_data.nodes.map((node) => node.id));

    // Filter links to only those where both source and target exist in the nodes array
    const validLinks = _data.links.filter(
      (link) => nodeIds.has(link.source) && nodeIds.has(link.target)
    );

    // Use the filtered links for the data
    this.data = { nodes: _data.nodes, links: validLinks };

    this.initVis();
  }

  initVis() {
    const {
      parentElement,
      width,
      marginTop,
      marginRight,
      marginBottom,
      marginLeft,
    } = this.config;

    console.log("data: ", this.data);
    // Extract nodes and links
    const { nodes, links } = this.data;
    // console.log("nodes: ", nodes);
    // console.log("links: ", links);
    //     let nodeIds = new Set(nodes.map(node => node.id));
    // links.forEach(link => {
    //   if (!nodeIds.has(link.source) || !nodeIds.has(link.target)) {
    //     console.error("Invalid link reference:", link);
    //   }
    // });
    // const validLinks = links.filter(link => nodeIds.has(link.source) && nodeIds.has(link.target));
    // this.data = { nodes, links: validLinks };

    // Create a color scale for nodes and links
    const color = d3.scaleOrdinal(d3.schemeCategory10);

    // A function to check if source and target have the same group
    function samegroup({ source, target }) {
      return source === target ? source : null;
    }

    // Create the SVG container
    this.svg = d3
      .select(parentElement)
      .append("svg")
      .attr("width", "100%")
      .attr(
        "height",
        (nodes.length - 1) * this.config.step + marginTop + marginBottom
      )
      .attr("viewBox", [
        -150,
        0,
        width + 350,
        (nodes.length - 1) * this.config.step + marginTop + marginBottom,
      ])
      .attr("style", "max-width: 100%; height: auto;");

    // The current position, indexed by id. Will be interpolated.
    // this.Y = new Map(
    //   nodes.map(
    //     ({ id }) => [
    //       id,
    //       d3
    //         .scalePoint(nodes.map((d) => d.id))
    //         .range([
    //           marginTop,
    //           (nodes.length - 1) * this.config.step + marginBottom,
    //         ])(id),
    //     ],
    //   )
    // );
    this.Y = new Map(
      nodes.map(({ id }, index) => {
        let yPosition = marginTop + index * this.config.step;
        return [id, yPosition];
      })
    );

    // // Add an arc for each link.
    // function arc(d) {
    //   console.log("source: ", this.Y.get(d.source));
    //   const y1 = this.Y.get(d.source);
    //   const y2 = this.Y.get(d.target);
    //   const r = Math.abs(y2 - y1) / 2;
    //   return `M${marginLeft},${y1}A${r},${r} 0,0,${
    //     y1 < y2 ? 1 : 0
    //   } ${marginLeft},${y2}`;
    // }

    // Inside your initVis method

    // // Add an arc for each link using an arrow function to maintain the context of 'this'
    // const arc = (d) => {
    //   console.log("source: ", this.Y.get(d.source));
    //   const y1 = this.Y.get(d.source);
    //   const y2 = this.Y.get(d.target);
    //   const r = Math.abs(y2 - y1) / 2;
    //   return `M${marginLeft},${y1}A${r},${r} 0,0,${y1 < y2 ? 1 : 0} ${marginLeft},${y2}`;
    // };
    const arc = (d) => {
      const y1 = this.Y.get(d.source);
      const y2 = this.Y.get(d.target);
      if (y1 === undefined || y2 === undefined) {
        console.error("Undefined Y position:", d);
        return ""; // Return an empty path if positions are undefined
      }
      const r = Math.abs(y2 - y1) / 2;
      return `M${marginLeft},${y1}A${r},${r} 0,0,${
        y1 < y2 ? 1 : 0
      } ${marginLeft},${y2}`;
    };

    this.path = this.svg
      .insert("g", "*")
      .attr("fill", "none")
      .attr("stroke-opacity", 0.6)
      .attr("stroke-width", 1.5)
      .selectAll("path")
      .data(links)
      .join("path")
      .attr("stroke", (d) => color(samegroup(d)))
      .attr("d", arc);
    // this.path = this.svg
    //   .insert("g", "*")
    //   .attr("fill", "none")
    //   .attr("stroke-opacity", 0.6)
    //   .attr("stroke-width", 1.5)
    //   .selectAll("path")
    //   .data(links)
    //   .join("path")
    //   .attr("stroke", (d) => color(samegroup(d)))
    //   .attr("d", arc);

    // Add a text label and a dot for each node.
    this.label = this.svg
      .append("g")
      .attr("font-family", "sans-serif")
      .attr("font-size", 10)
      .attr("text-anchor", "end")
      .selectAll("g")
      .data(nodes)
      .join("g")
      .attr("transform", (d) => `translate(${marginLeft},${this.Y.get(d.id)})`)
      .call((g) =>
        g
          .append("text")
          .attr("x", -6)
          .attr("dy", "0.35em")
          .attr("fill", (d) => d3.lab(color(d.id)).darker(2))
          .text((d) => d.id)
      )
      .call((g) =>
        g
          .append("circle")
          .attr("r", 3)
          .attr("fill", (d) => color(d.id))
      );

    // Add invisible rects that update the class of the elements on mouseover.
    this.label
      .append("rect")
      .attr("fill", "none")
      .attr("width", marginLeft + 40)
      .attr("height", this.config.step)
      .attr("x", -marginLeft)
      .attr("y", -this.config.step / 2)
      .attr("fill", "none")
      .attr("pointer-events", "all")
      .on("pointerenter", (event, d) => {
        this.svg.classed("hover", true);
        this.label.classed("primary", (n) => n === d);
        this.label.classed("secondary", (n) =>
          links.some(
            ({ source, target }) =>
              (n.id === source && d.id == target) ||
              (n.id === target && d.id === source)
          )
        );
        this.path
          .classed("primary", (l) => l.source === d.id || l.target === d.id)
          .filter(".primary")
          .raise();
      })
      .on("pointerout", () => {
        this.svg.classed("hover", false);
        this.label.classed("primary", false);
        this.label.classed("secondary", false);
        this.path.classed("primary", false).order();
      });

    // Add styles for the hover interaction.
    this.svg.append("style").text(`
        .hover text { fill: #aaa; }
        .hover g.primary text { font-weight: bold; fill: #333; }
        .hover g.secondary text { fill: #333; }
        .hover path { stroke: #ccc; }
        .hover path.primary { stroke: #333; }
      `);
  }

  updateVis(order) {
    // Update Y scale domain
    this.Y.domain(order);

    // Update labels position
    this.label
      .sort((a, b) => d3.ascending(this.Y.get(a.id), this.Y.get(b.id)))
      .transition()
      .duration(750)
      .delay((d, i) => i * 20) // Make the movement start from the top.
      .attrTween("transform", (d) => {
        const i = d3.interpolateNumber(this.Y.get(d.id), this.Y(d.id));
        return (t) => {
          const y = i(t);
          this.Y.set(d.id, y);
          return `translate(${this.config.marginLeft},${y})`;
        };
      });

    // Update arcs
    this.path
      .transition()
      .duration(750 + this.nodes.length * 20) // Cover the maximum delay of the label transition.
      .attrTween("d", (d) => () => this.arc(d));
  }

  arc(d) {
    const y1 = this.Y.get(d.source);
    const y2 = this.Y.get(d.target);
    const r = Math.abs(y2 - y1) / 2;
    return `M${this.config.marginLeft},${y1}A${r},${r} 0,0,${y1 < y2 ? 1 : 0} ${
      this.config.marginLeft
    },${y2}`;
  }
}
