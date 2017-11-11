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
      punctuationRE: /[.,!?:;"']/g,
      processors: [
        function(entry) {
          return entry.toLowerCase();
        },
        function(entry) {
          return entry.replace(config.punctuationRE, '');
        },
        function(entry) {
          var stopWords = config.stopWords;
          var terms = getTerms(entry);
          var i = terms.length;
    
          while((i--) !== 0) {
            if(stopWords.indexOf(terms[i]) !== -1) {
              terms.splice(i, 1);
            }
          }
    
          return terms.join(' ');
        }
      ]
    };
    
    var getTerms = function(entry) {
      var terms = entry.split(whitespaceRE);
    
      if(terms[0].length === 0) {
        terms.shift();
      }
    
      if(terms[terms.length - 1].length === 0) {
        terms.pop();
      }
    
      return terms;
    }
    
    var processEntry = function(entry) {
      var processors = config.processors;
    
      for(var i = 0; i < processors.length; i++) {
        entry = processors[i](entry);
      }
    
      return entry;
    }
    
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
    
    var Wade = function(data) {
      var search = function(query) {
        var index = search.index;
        var processed = processEntry(query);
        var results = [];
        var resultIndexes = {};
    
        if(processed.length === 0) {
          return results;
        } else {
          var terms = getTerms(processed);
          var termsLength = terms.length;
          var exactTermsLength = termsLength - 1;
          var increment = 1 / termsLength;
    
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
            node$1 = node$1[lastTerm[i$1]];
            if(node$1 === undefined) {
              break;
            }
          }
    
          if(node$1 !== undefined) {
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
          }
    
          return results;
        }
      }
    
      if(Array.isArray(data) === true) {
        search.index = Wade.index(data);
      } else {
        search.index = data;
      }
    
      return search;
    }
    
    Wade.index = function(data) {
      var dataLength = data.length;
      var index = {};
      var nodes = [];
    
      for(var i = 0; i < dataLength; i++) {
        var entry = processEntry(data[i]);
        if(entry.length !== 0) {
          var terms = getTerms(entry);
          var termsLength = terms.length;
    
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
                data: [1 / termsLength, i]
              };
              nodes.push(node);
            } else {
              node = node[lastChar];
              var nodeData = node.data;
    
              if(nodeData === undefined) {
                node.data = [1 / termsLength, i];
                nodes.push(node);
              } else {
                nodeData[0] += 1 / termsLength;
                nodeData.push(i);
              }
            }
          }
        }
      }
    
      for(var i$1 = 0; i$1 < nodes.length; i$1++) {
        var nodeData$1 = nodes[i$1].data;
        nodeData$1[0] = 1.5 - (nodeData$1[0] / dataLength);
      }
    
      return index;
    }
    
    Wade.save = function(search) {
      return search.index;
    }
    
    Wade.config = config;
    
    Wade.version = "0.3.3";
    
    return Wade;
}));
