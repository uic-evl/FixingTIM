"use strict";

// global application variable
var App = App || {};

// Utilities class for mapping protein names
const DatabaseMappingUtils = function(){

  /* Global Class Variable*/
  let mappingUtils = {};

  /* A dictionary for all the mapped proteins that were previously queried */
  mappingUtils.mappedProteins = {};

  /* Map from uniprot 'mneumonic' to PDB code*/
  function map_mnemonic_to_PDB(mnemonic){
    return new Promise(function(resolve, reject) {
      /* Use d3 to query UniProt for the tab-separated name conversion*/
      d3.tsv("http://www.uniprot.org/uniprot/?query=" + mnemonic +
          "&format=tab&compress=no&columns=entry name,database(PDB)", function(data) {

        /* No model exists */
        if(!data[0]){
          /* reject and exit  */
          reject(null);
          return;
        }

        let parsedData = [];
        /* Add the retrieved names to the dictionary */
        data.forEach(function(d){
          parsedData.push( {
            "PDB" : _.dropRight(d["Cross-reference (PDB)"].split(";")),
            "mnemonic" : d["Entry name"]
          });
        });

        // mappingUtils.mappedProteins[mnemonic] = mappedName;

        /* Resolve the promise with the converted name*/
        resolve(parsedData)
      });
    });
  }

  function check_PDB_names(pdb_query){
    return new Promise(function(resolve, reject) {
      d3.xml("https://www.rcsb.org/pdb/rest/idStatus?structureId="+pdb_query, function(data){
        resolve(data);
      });
    });

  }

  return {
    mnemonicToPDB : map_mnemonic_to_PDB,
    checkPDBs: check_PDB_names
  };

};