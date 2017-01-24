"use strict";

// global application variable
var App = App || {};

// Protein / Molecule Viewer "Class"
var TrendImageViewer = function(){

  /* initialize the molecular viewer global variable */
  let viewer = {};

  function constructTrendImage(family) {

    let data = [];
    console.log(family);

    family.forEach(function(memberProtein) {
      memberProtein.sequence.forEach(function(residue,i){
        data.push({
          protein : memberProtein.name,
          x       : i,
          residue : residue
        })
      });
    });

    return data;

  }

  function initialize(id) {

    /* get the DOM element by the id parameter */
    viewer.domObj = d3.select(id);

    /* get/save the width and height of the given DOM element */
    viewer.width = App.trendWidth;
    viewer.height = App.trendHeight;

    /* clear the trend image DOM */
    viewer.domObj.selectAll().remove();

    /* append a new svg trend image */
    viewer.domObj
      .style("width", viewer.width)
      .style("height", viewer.height)
    ;

  }

  function render(family) {

    /* Convert the data into a residue-based array */
    let data = constructTrendImage(family);

    /* Get the length of the longest sequence */
    let max_sequence_length = _.max(d3.set(family.map(function( residue ) { return residue.length; } )).values());

    /* Extract the names of the proteins. They will construct the y-axis*/
    let y_elements = d3.set(family.map(function( residue ) { return residue.name; } )).values();

    /* construct the y-scale */
    let yScale = d3.scale.ordinal()
        .domain(y_elements)
        .rangeBands([0, y_elements.length * 22]);

    /* construct the x-scale */
    let xScale = d3.scale.linear()
        .domain([0, max_sequence_length])
        .range([0, max_sequence_length * 22])
        ;

    /* construct the x-axis*/
    let xAxis = d3.svg.axis()
        .scale(xScale)
        .tickFormat(function (d) {
          return d;
        })
        .orient("top");

    /* construct the y-axis*/
    let yAxis = d3.svg.axis()
        .scale(yScale)
        .tickFormat(function (d) {
          return d;
        })
        .orient("left");

    /* Add the svg to the trend image dom*/
    let svg = viewer.domObj
        .append("svg") //svg
        .attr("class", "trendImage")
        .style("width", viewer.width)
        .style("height", viewer.height)
        .append("g")
        .attr("transform", "translate(" + 50 + "," + 50 + ")")
        ;

    /* Construct the image out of each residue  */
    svg.selectAll("rect")
        .data(data)
        .enter().append('g').append('rect')
        .attr("class", "residue")
        .attr("width", 22)
        .attr("height", 22)
        .attr('y', function(d) { return yScale(d.protein) })
        .attr('x', function(d) { return xScale(d.x) })
        .attr('fill', function(d, i) { return colorbrewer.Spectral[10][i%10]; })
        ;

    /* Add the axes -- this will be removed later*/
    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .selectAll('text')
        .attr('font-weight', 'normal');

    svg.append("g")
        .attr("class", "x axis")
        .call(xAxis)
        .selectAll('text')
        .attr('font-weight', 'normal')
        .style("text-anchor", "start")
        .attr("dx", ".8em")
        .attr("dy", ".5em")
        .attr("transform", function (d) {
          return "rotate(-65)";
        });

  }

  /* Return the publicly accessible functions*/
  return {
    init: initialize,
    render: render
  };

};