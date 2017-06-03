"use strict";

// Global Application variable
var App = App || {};

/*** KO Class ***/
function ApplicationModel() {

  // self reference
  let self = {
    proteins      : {},
    leftProtein   : {},
    rightProtein  : {},
    proteinFamily : {}
  };

  /* Render the 3D and Sequence Views */
  function render_views(structure) {
    /* No structure was returned */
    if(!structure) return;

    /* Render the 3D view */
    this.view.render(structure, this.modelPointer.name);

    // get the sequence of the protein
    this.modelPointer.sequence = this.view.getSequence(this.modelPointer.structure, 0);

    // initialize the sequence viewer
    App.sequenceViewer.init(this.viewPosition + "MolecularViewer-Sequence");

    /* Check if a sequence is already added to the list, if so align them*/
    if(this.siblingPointer.name){
      /* Align the sequences */
      App.align(this.modelPointer.sequence, this.siblingPointer.sequence, {})
        .then(function(seq){
          /* Set the model sequences */
          this.modelPointer.sequence   = (this.viewPosition === "left")
            ? seq.leftSequence  : seq.rightSequence;
          this.siblingPointer.sequence = (this.siblingPosition === "right")
            ? seq.rightSequence : seq.leftSequence;

          /* Render the other sequence */
          App.sequenceViewer.render(this.siblingPosition + "MolecularViewer-Sequence", this.siblingPointer.sequence);
        }.bind(this));
    }
    // render the sequence list
    App.sequenceViewer.render(this.viewPosition + "MolecularViewer-Sequence", this.modelPointer.sequence);
  }


  /* Calculate all of the sorting metrics for family */
  function calculate_all_sorting_scores(protein) {
    return new Promise(function(resolve, reject) {
      /* Calculate the column frequency scores and enable the menu option */
      self.sortedSequences.calculateFrequencyScores()
          .then((scores) => {
            $("#residue_freq_li").find("a").removeClass("disabled");
            self.proteinFamily.setScores("residue_frequency", scores);
          });
      /* Calculate the edit distance scores with the first protein and enable the menu option */
      self.sortedSequences.calculateEditDistanceScores(protein)
          .then((scores) => {
            $("#edit_dist_li").find("a").removeClass("disabled");
            self.proteinFamily.setScores("edit_distance", scores);
          });
      /* Calculate the weighted edit distance scores with the first protein and enable the menu option */
      self.sortedSequences.calculateEditDistanceScores(protein, {insertion: 3, deletion: 3, substitution: 5})
          .then((scores) => {
            $("#weighted_edit_dist_li").find("a").removeClass("disabled");
            self.proteinFamily.setScores("weighted_edit_distance", scores);
          });
      /* Calculate the residue commonality scores with the first protein and enable the menu option */
      self.sortedSequences.calculateCommonalityScores(protein)
          .then((scores) => {
            $("#commonality_li").find("a").removeClass("disabled");
            self.proteinFamily.setScores("commonality_scores", scores);
          });
      /* Calculate the weighted residue commonality scores with the first protein and enable the menu option */
      self.sortedSequences.calculateCommonalityScores(protein, 1)
          .then((scores) => {
            $("#normalized_commonality_li").find("a").removeClass("disabled");
            self.proteinFamily.setScores("normalized_commonality_scores", scores);
          });
    });

  }


  /* Form callback to process the family datafile */
  function parse_and_store_family(file_data, ext) {
    /* Remove the Splash screen */
    $("#trendSplash").remove();
    self.proteinFamily = new ProteinFamily({file: file_data, ext: ext});

    /* Create the sorting callbacks */
    self.sortedSequences = new SequenceSorting(self.proteinFamily.getFamily());

    /* Initial sorting -- order the file is read in*/
    $("#initial_sort_li")
        .addClass("active-selection")
        .find("a").removeClass("disabled");

    /* Calculate the residue frequencies per column */
    self.sortedSequences.calculateFrequency();

    /* Set the protein family and column sequence data */
    App.trendImageViewer.setProteinFamily(self.proteinFamily.getFamily());
    App.trendImageViewer.setColumnFrequency(self.sortedSequences);

    /* Initialize the trend image view */
    App.trendImageViewer.init("#trendImageViewer");

    /* Render the trend image */
    App.trendImageViewer.render().then(function(){
      /* Sadly, the GPU does not match the processor's render calls.
         Need an ever-so-slightly pause to ensure the trend image appears before we sort*/
      setTimeout(function(){
        calculate_all_sorting_scores(self.proteinFamily.getFamily()[0]);
      }, 1000);
    });
  }


  /* Return the public-facing functions */
  return {
    processProteinFamily  : parse_and_store_family
  };
}