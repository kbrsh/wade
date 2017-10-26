/**
 * Wade v0.3.3
 * Copyright 2017 Kabir Shah
 * Released under the MIT License
 * https://github.com/kbrsh/wade
 */

(function(root, factory) {
  /* ======= Global Wade ======= */
  if(typeof module === "undefined") {
    root.Wade = factory();
  } else {
    module.exports = factory();
  }
}(this, function() {
    var whitespaceRE = /\s+/g;
    
    var config = {
      stopWords: ["about", "after", "all", "also", "am", "an", "and", "another", "any", "are", "as", "at", "be", "because", "been", "before", "being", "between", "both", "but", "by", "came", "can", "come", "could", "did", "do", "each", "for", "from", "get", "got", "has", "had", "he", "have", "her", "here", "him", "himself", "his", "how", "if", "in", "into", "is", "it", "like", "make", "many", "me", "might", "more", "most", "much", "must", "my", "never", "now", "of", "on", "only", "or", "other", "our", "out", "over", "said", "same", "see", "should", "since", "some", "still", "such", "take", "than", "that", "the", "their", "them", "then", "there", "these", "they", "this", "those", "through", "to", "too", "under", "up", "very", "was", "way", "we", "well", "were", "what", "where", "which", "while", "who", "with", "would", "you", "your", "a", "i"],
      punctuationRE: /[.,!?:;"']/g
    };
    
    var update = function(results, resultIndexes, increment, data) {
      var relevance = data[0];
      for(var i = 1; i < data.length; i++) {
        var index = data[i];
        var resultIndex = resultIndexes[index];
        if(resultIndex === undefined) {
          var lastIndex = results.length;
          resultIndexes[index] = lastIndex;
          results[lastIndex] = {
            index: index,
            score: relevance * increment
          };
        } else {
          results[resultIndex].score += relevance * increment;
        }
      }
    }
    
    var getTerms = function(str) {
      var terms = str.split(whitespaceRE);
    
      if(terms[0].length === 0) {
        terms.shift();
      }
    
      if(terms[terms.length - 1].length === 0) {
        terms.pop();
      }
    
      return terms;
    }
    
    var lowercase = function(str) {
      return str.toLowerCase();
    }
    
    var removePunctuation = function(str) {
      return str.replace(config.punctuationRE, '');
    }
    
    var removeStopWords = function(str) {
      var stopWords = config.stopWords;
      var terms = getTerms(str);
      var i = terms.length;
    
      while((i--) !== 0) {
        if(stopWords.indexOf(terms[i]) !== -1) {
          terms.splice(i, 1);
        }
      }
    
      return terms.join(' ');
    }
    
    var Wade = function(data) {
      var search = function(item) {
        var index = search.index;
        var terms = getTerms(item);
        var termsLength = terms.length;
        var exactTermsLength = termsLength - 1;
        var increment = 1 / termsLength;
        var results = [];
        var resultIndexes = {};
    
        if(termsLength === 0) {
          return results;
        } else {
          exactOuter: for(var i = 0; i < exactTermsLength; i++) {
            var term = terms[i];
            var node = index;
    
            for(var j = 0; j < term.length; j++) {
              node = node[term[j]];
              if(node === undefined) {
                continue exactOuter;
              }
            }
    
            var nodeData = node.data;
            if(nodeData !== undefined) {
              update(results, resultIndexes, increment, nodeData);
            }
          }
    
          var lastTerm = terms[exactTermsLength];
          var node$1 = index;
    
          for(var i$1 = 0; i$1 < lastTerm.length; i$1++) {
            var existingNode = node$1[lastTerm[i$1]];
            if(existingNode === undefined) {
              break;
            } else {
              node$1 = existingNode;
            }
          }
    
          var nodeStack = [node$1];
          var childNode;
          while((childNode = nodeStack.pop())) {
            var childNodeData = childNode.data;
            if(childNodeData !== undefined) {
              update(results, resultIndexes, increment, childNodeData);
            }
    
            for(var char in childNode) {
              nodeStack.push(childNode[char]);
            }
          }
    
    
          return results;
        }
      }
    
      if(Array.isArray(data) === true) {
        var dataLength = data.length;
        var normalizedData = [];
    
        for(var i = 0; i < dataLength; i++) {
          var item = Wade.process(data[i]);
          if(item.length !== 0) {
            normalizedData.push(item);
          }
        }
    
        search.index = Wade.index(normalizedData);
        search.data = normalizedData;
      } else {
        search.index = data.index;
        search.data = data.data;
      }
    
      return search;
    }
    
    Wade.pipeline = [lowercase, removePunctuation, removeStopWords];
    
    Wade.process = function(item) {
      var pipeline = Wade.pipeline;
    
      for(var i = 0; i < pipeline.length; i++) {
        item = pipeline[i](item);
      }
    
      return item;
    }
    
    Wade.index = function(data) {
      var dataLength = data.length;
      var index = {};
      var termsLengths = [];
      var nodes = [];
    
      for(var i = 0; i < dataLength; i++) {
        var terms = getTerms(data[i]);
        var termsLength = terms.length;
    
        termsLengths.push(termsLength);
    
        for(var j = 0; j < termsLength; j++) {
          var term = terms[j];
          var termLength = term.length - 1;
          var node = index;
    
          for(var n = 0; n < termLength; n++) {
            var char = term[n];
            var existingNode = node[char];
    
            if(existingNode === undefined) {
              existingNode = node[char] = {};
            }
    
            node = existingNode;
          }
    
          var lastChar = term[termLength];
          if(node[lastChar] === undefined) {
            node = node[lastChar] = {
              data: [1, i]
            };
            nodes.push(node);
          } else {
            node = node[lastChar];
            var nodeData = node.data;
    
            if(nodeData === undefined) {
              node.data = [1, i];
              nodes.push(node);
            } else {
              nodeData.push(i);
            }
          }
        }
      }
    
      for(var i$1 = 0; i$1 < nodes.length; i$1++) {
        var node$1 = nodes[i$1];
        var nodeData$1 = node$1.data;
        var currentLength = 1;
        var currentAverage = 0;
    
        for(var j$1 = 1; j$1 < nodeData$1.length; j$1++) {
          var dataIndex = nodeData$1[j$1];
          if(nodeData$1[j$1 + 1] === dataIndex) {
            currentLength++;
          } else {
            currentAverage += currentLength / termsLengths[dataIndex];
            currentLength = 1;
          }
        }
    
        nodeData$1[0] = 1.5 - (currentAverage / dataLength);
      }
    
      return index;
    }
    
    Wade.save = function(search) {
      return {
        data: search.data,
        index: search.index
      }
    }
    
    Wade.config = config;
    
    Wade.version = "0.3.3";
    
    return Wade;
}));
