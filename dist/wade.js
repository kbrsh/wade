/**
 * Wade v0.3.0
 * Copyright 2017 Kabir Shah
 * Released under the MIT License
 */

(function(root, factory) {
  /* ======= Global Wade ======= */
  (typeof module === "object" && module.exports) ? module.exports = factory() : root.Wade = factory();
}(this, function() {
    var stopWords = ['about', 'after', 'all', 'also', 'am', 'an', 'and', 'another', 'any', 'are', 'as', 'at', 'be', 'because', 'been', 'before', 'being', 'between', 'both', 'but', 'by', 'came', 'can', 'come', 'could', 'did', 'do', 'each', 'for', 'from', 'get', 'got', 'has', 'had', 'he', 'have', 'her', 'here', 'him', 'himself', 'his', 'how', 'if', 'in', 'into', 'is', 'it', 'like', 'make', 'many', 'me', 'might', 'more', 'most', 'much', 'must', 'my', 'never', 'now', 'of', 'on', 'only', 'or', 'other', 'our', 'out', 'over', 'said', 'same', 'see', 'should', 'since', 'some', 'still', 'such', 'take', 'than', 'that', 'the', 'their', 'them', 'then', 'there', 'these', 'they', 'this', 'those', 'through', 'to', 'too', 'under', 'up', 'very', 'was', 'way', 'we', 'well', 'were', 'what', 'where', 'which', 'while', 'who', 'with', 'would', 'you', 'your', 'a', 'i'];
    var punctuationRE = /\.|\,|\!/g;
    
    var getRoot = function(pattern, index) {
      var node = index;
    
      for(var i = 0; i < pattern.length; i++) {
        var char = pattern[i];
        node = node[char];
        if(node === undefined) {
          break;
        }
      }
    
      return node;
    }
    
    var updateResults = function(id, results, resultsLocations, scoreIncrement) {
      var location = null;
    
      for(var i = 0; i < id.length; i++) {
        var documentID = id[i];
        location = resultsLocations[documentID];
    
        if(location === undefined) {
          resultsLocations[documentID] = results.length;
          results.push({
            index: documentID,
            score: scoreIncrement
          });
        } else {
          results[location].score += scoreIncrement;
        }
      }
    }
    
    var contains = function(pattern, index, results, resultsLocations, scoreIncrement) {
      var node = getRoot(pattern, index);
    
      if(node !== undefined && node.id !== undefined) {
        updateResults(node.id, results, resultsLocations, scoreIncrement);
      }
    }
    
    var containsPrefix = function(pattern, index, results, resultsLocations, scoreIncrement) {
      var node = getRoot(pattern, index);
    
      if(node !== undefined) {
        var stack = [node];
        var current = null;
        var currentIndex = 0;
    
        while(stack.length !== 0) {
          current = stack[currentIndex];
          if(current.id !== undefined) {
            updateResults(current.id, results, resultsLocations, scoreIncrement);
          }
    
          stack.pop();
          currentIndex--;
    
          for(var child in current) {
            stack.push(current[child]);
            currentIndex++;
          }
        }
      }
    }
    
    var getWords = function(str) {
      var lastIndex = str.length - 1;
    
      if(str[0] === " ") {
        str = str.substring(1);
      }
    
      if(str[lastIndex] === " ") {
        str = str.substring(0, lastIndex);
      }
    
      return str.split(" ");
    }
    
    var lowercase = function(str) {
      return str.toLowerCase();
    }
    
    var removePunctuation = function(str) {
      return str.replace(punctuationRE, "");
    }
    
    var removeStopWords = function(str) {
      var words = getWords(str);
    
      for(var i = 0; i < words.length; i++) {
        if(stopWords.indexOf(words[i]) !== -1) {
          words.splice(i, 1);
        }
      }
    
      return words.join(" ");
    }
    
    var Wade = function(data) {
      var search = function(item) {
        var index = search.index;
        var keywords = getWords(Wade.process(item));
        var keywordsLength = keywords.length;
        var fullwordsLength = keywordsLength - 1;
        var scoreIncrement = 1 / keywordsLength;
        var results = [];
        var resultsLocations = {};
    
        for(var i = 0; i < fullwordsLength; i++) {
          contains(keywords[i], index, results, resultsLocations, scoreIncrement);
        }
    
        containsPrefix(keywords[fullwordsLength], index, results, resultsLocations, scoreIncrement);
    
        return results;
      }
    
      if(Array.isArray(data)) {
        for(var i = 0; i < data.length; i++) {
          data[i] = Wade.process(data[i]);
        }
    
        search.index = Wade.index(data);
        search.data = data;
      } else {
        search.index = data.index;
        search.data = data.data;
      }
    
      return search;
    }
    
    Wade.pipeline = [lowercase, removePunctuation, removeStopWords];
    
    Wade.process = function(item) {
      var pipeline = Wade.pipeline;
    
      for(var j = 0; j < pipeline.length; j++) {
        item = pipeline[j](item);
      }
    
      return item;
    }
    
    Wade.index = function(data) {
      var index = {};
      for(var i = 0; i < data.length; i++) {
        var str = getWords(data[i]);
        for(var j = 0; j < str.length; j++) {
          var item = str[j];
          var itemLength = item.length - 1;
          var node = index;
    
          for(var n = 0; n < itemLength; n++) {
            var char = item[n];
            var newNode = node[char];
            newNode = newNode === undefined ? {} : newNode;
            node[char] = newNode;
            node = newNode;
          }
    
          var lastChar = item[itemLength];
          if(node[lastChar] === undefined) {
            node[lastChar] = {
              id: [i]
            }
          } else {
            node = node[lastChar];
            if(node.id === undefined) {
              node.id = [i];
            } else {
              node.id.push(i);
            }
          }
        }
      }
      return index;
    }
    
    Wade.save = function(search) {
      return {
        data: search.data,
        index: search.index
      }
    }
    
    Wade.version = "0.3.0";
    
    return Wade;
}));
