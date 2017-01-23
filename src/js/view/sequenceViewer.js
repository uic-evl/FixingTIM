"use strict";

// global application variable
var App = App || {};

// Protein Sequence Viewer "Class"
var SequenceViewer = function(){

  /* initialize the sequence viewer global variable */
  let list = {};

  /* Initialize the sequence view */
  function initialize(id, options){

    /* Get the width and height */
    // The width is twice the client width because of bootstrap
    list.domWidth = d3.select(id).node().clientWidth * 2;
    // we want the height to be that of the 3D Viewers
    list.domHeight = App.leftViewer.getDimensions().height;

    // clear the dom of the previous list
    d3.select(id).selectAll().remove();

    // append a new span for the list
    d3.select(id)
        .style("height", list.domHeight)
        .append("span") // span element
        // .attr("width", list.domWidth / 2) // the width is half the column
        // .attr("height", list.domHeight) // set the height
        .attr("class", "sequence") // set the styling to the sequence class
    ;
  }

  /* Render the sequence list */
  function render(id, sequence) {
    /* Add a span to the list view and populate it with the residues */
    let view = d3.select(id).select("span")
        .selectAll("span")
        // JOIN: Add the data to the Dom
        .data(sequence);
    // UPDATE: add new elements if needed
    view
        .enter().append("span")
        .attr("class", "residue")
        /* Merge the old elements (if they exist) with the new data */
        .merge(view)
          .text(function(d) { return d; })
        .style("width", list.domWidth / 2)
        .style("background-color", function(d, i) { return colorbrewer.Spectral[10][i%10]; })
        // EXIT: Remove unneeded DOM elements
        .exit().remove();
  }

  /* return the public-facing functions */
  return {
    init   : initialize,
    render : render
  };
};