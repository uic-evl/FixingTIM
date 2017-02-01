"use strict";

// Global Application variable
var App = App || {};

(function(){

  // Default PV viewer options
  App.options = {
    antialias: true,
    quality : 'medium',
    background: 'black'
  };

  /* Starting point of the program. Initializes the application */
  function init() {

    /* Set the size of the 3D Divs*/
    let leftDom  = document.getElementById('leftViewer').parentNode;
    let rightDom = document.getElementById('rightViewer').parentNode;

    /* Set the size of the family viewer */
    let trendDom = document.getElementById('trendImageViewer').parentNode;

    /* The size of the EVL header */
    let headerHeight = 104;

    /* Aspect Ratio */
    App.aspectRatio = window.innerWidth > ( window.innerHeight - headerHeight ) ?
        (window.innerHeight - headerHeight)/window.innerWidth :
        window.innerWidth / (window.innerHeight- headerHeight) ;

    /* Calculate the height and width of the molecular viewers */
    App.molecularViewerWidth  = leftDom.clientWidth;
    App.molecularViewerHeight = App.molecularViewerWidth * App.aspectRatio;

    /* Calculate the height and width of the trend image */
    App.trendWidth   = trendDom.clientWidth;
    App.trendHeight  = (window.innerHeight - App.molecularViewerHeight) * App.aspectRatio;

    /* Calculate the height and width of the frequency viewer */
    App.frequencyWidth  = App.trendWidth / 2.0;
    App.frequencyHeight = (window.innerHeight - App.molecularViewerHeight - App.trendHeight) * App.aspectRatio;

    /* Set the div height for the molecular viewers */
    leftDom.style.height  = App.molecularViewerHeight;
    rightDom.style.height = App.molecularViewerHeight;

    /* Set the div height for the trend image */
    trendDom.style.height = App.trendHeight;

    /* Create the Data Mapping Utility Library */
    App.dataUtils = new DatabaseMappingUtils();

    /* create the left and right viewers */
    App.leftViewer  = new MolecularViewer();
    App.rightViewer = new MolecularViewer();

    /* Setup the sequence viewer */
    App.sequenceViewer = new SequenceViewer();

    /* Setup the trend image viewer */
    App.trendImageViewer = new TrendImageViewer();

    /* Setup the frequency histogram viewers*/
    App.leftFrequencyViewer = new FrequencyViewer();
    App.rightFrequencyViewer = new FrequencyViewer();

    /* Bind the model to the view*/
    App.proteins = new Proteins();
    ko.applyBindings(App.proteins);

    /* Setup the protein selection overlays */
    App.setupOverlays();

    /* Setup the protein file upload */
    App.setupUpload("left");
    App.setupUpload("right");
    App.setupFamilyUploader("family");

    App.dataUtils.mneumonicToPDB("SHRM_DROME").then(function(protein_name) {
      console.log(protein_name);
    });

  }

  /* start the application once the DOM is ready */
  document.addEventListener('DOMContentLoaded', init);

})();