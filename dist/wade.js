/**
 * Wade v0.1.0
 * Copyright 2017 Kabir Shah
 * Released under the MIT License
 */

(function(root, factory) {
  /* ======= Global Wade ======= */
  (typeof module === "object" && module.exports) ? module.exports = factory() : root.Wade = factory();
}(this, function() {
    var createTable = function(item, length) {
      var table = new Array(length);
      table[0] = 0;
    
      for(var i = 1; i < length; i++) {
        var section = item.substring(0, i + 1);
        var sectionLength = section.length;
        var val = 0;
    
        for(var j = sectionLength - 1; j > 0; j--) {
        	var prefix = section.substring(0, j);
          var suffix = section.slice(-j);
          if(prefix === suffix) {
          	val = prefix.length;
            break;
          }
        }
    
        table[i] = val;
      }
    
      return table;
    }
    
    var contains = function(item, str, table) {
    	var m = item.length;
      var n = str.length;
      var searchable = n - m + 1;
    
      var table = createTable(item);
    
      var match = false;
    
      for(var i = 0; i < searchable; i++) {
      	var partial = "";
    
      	for(var j = 0; j < m; j++) {
        	var char = item[j];
        	if(char === str[i + j]) {
          	match = true;
            partial += char;
          } else {
          	match = false;
            break;
          }
        }
    
      	var partialLength = partial.length;
        var tableValue = undefined;
        var skip = 0;
        if(match === true) {
        	break;
        } else if(partialLength !== 0 && (tableValue = table[partialLength - 1]) > 0 && (skip = partialLength - table[partialLength - 1]) > 0) {
        	i += skip;
        }
      }
    
      return match;
    }
    
    var Wade = function(data) {
      var search = function(item) {
        var data = search.data;
        var keywords = item.split(" ");
        var keywordsLength = keywords.length;
        var results = [];
    
        for(var i = 0; i < data.length; i++) {
          var score = 0;
          var chunk = data[i];
    
          for(var j = 0; j < keywordsLength; j++) {
            if(contains(keywords[j], chunk) === true) {
              score++;
            }
          }
    
          score = score / keywordsLength;
    
          if(score > 0) {
            results.push({
              index: i,
              score: score
            });
          }
    
        }
    
        return results;
      }
    
      search.data = data;
    
      return search;
    }
    
    Wade.normalize = function(item) {
      return item.toLowerCase();
    }
    
    Wade.normalizeAll = function(data) {
      for(var i = 0; i < data.length; i++) {
        var item = data[i];
        data[i] = Wade.normalize(item);
      }
    
      return data;
    }
    
    Wade.version = "0.1.0";
    
    return Wade;
}));
