/**
 * Wade v0.3.3
 * Copyright 2017-2018 Kabir Shah
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
      punctuationRE: /[!"',.:;?]/g,
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
      if(entry.length === 0) {
        return entry;
      } else {
        var processors = config.processors;
    
        for(var i = 0; i < processors.length; i++) {
          entry = processors[i](entry);
        }
    
        return entry;
      }
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
        var offset = index[0];
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
              node = node[term.charCodeAt(j) + offset];
              if(node === undefined) {
                continue exactOuter;
              }
            }
    
            var nodeData = node[0];
            if(nodeData !== undefined) {
              update(results, resultIndexes, increment, nodeData);
            }
          }
    
          var lastTerm = terms[exactTermsLength];
          var node$1 = index;
    
          for(var i$1 = 0; i$1 < lastTerm.length; i$1++) {
            node$1 = node$1[lastTerm.charCodeAt(i$1) + offset];
            if(node$1 === undefined) {
              break;
            }
          }
    
          if(node$1 !== undefined) {
            var nodes = [node$1];
            for(var i$2 = 0; i$2 < nodes.length; i$2++) {
              var childNode = nodes[i$2];
              var childNodeData = childNode[0];
    
              if(childNodeData !== undefined) {
                update(results, resultIndexes, increment, childNodeData);
              }
    
              for(var j$1 = 1; j$1 < childNode.length; j$1++) {
                var grandChildNode = childNode[j$1];
                if(grandChildNode !== undefined) {
                  nodes.push(grandChildNode);
                }
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
      var dataLength = 0;
      var minimumByte = 256;
      var maximumByte = -1;
      var processed = [];
    
      for(var i = 0; i < data.length; i++) {
        var entry = processEntry(data[i]);
    
        if(entry.length !== 0) {
          var terms = getTerms(entry);
          var termsLength = terms.length;
    
          for(var j = 0; j < termsLength; j++) {
            var term = terms[j];
            var processedTerm = [i];
            var node = index;
    
            for(var n = 0; n < term.length; n++) {
              var char = term.charCodeAt(n);
              var highByte = char >>> 8;
              var lowByte = char & 0xFF;
    
              if(highByte !== 0) {
                if(highByte < minimumByte) {
                  minimumByte = highByte;
                }
    
                if(highByte > maximumByte) {
                  maximumByte = highByte;
                }
    
                processedTerm.push(highByte);
              }
    
              if(lowByte < minimumByte) {
                minimumByte = lowByte;
              }
    
              if(lowByte > maximumByte) {
                maximumByte = lowByte;
              }
    
              processedTerm.push(lowByte);
            }
    
            processed.push(termsLength);
            processed.push(processedTerm);
          }
    
          dataLength++;
        }
      }
    
      var offset = 1 - minimumByte;
      var size = maximumByte - minimumByte + 2;
    
      if(size < 0) {
        size = 1;
      }
    
      var nodeDataSets = [];
      var index = new Array(size);
      index[0] = offset;
    
      for(var i$1 = 0; i$1 < processed.length; i$1 += 2) {
        var termsLength$1 = processed[i$1];
        var processedTerm$1 = processed[i$1 + 1];
        var processedTermLength = processedTerm$1.length - 1;
        var dataIndex = processedTerm$1[0];
        var node$1 = index;
    
        for(var j$1 = 1; j$1 < processedTermLength; j$1++) {
          var char$1 = processedTerm$1[j$1] + offset;
          var existingNode = node$1[char$1];
    
          if(existingNode === undefined) {
            existingNode = node$1[char$1] = new Array(size);
          }
    
          node$1 = existingNode;
        }
    
        var lastChar = processedTerm$1[processedTermLength] + offset;
        if(node$1[lastChar] === undefined) {
          node$1 = node$1[lastChar] = new Array(size);
          nodeDataSets.push(node$1[0] = [1 / termsLength$1, dataIndex]);
        } else {
          node$1 = node$1[lastChar];
          var nodeData = node$1[0];
    
          if(nodeData === undefined) {
            nodeDataSets.push(node$1[0] = [1 / termsLength$1, dataIndex]);
          } else {
            nodeData[0] += 1 / termsLength$1;
            nodeData.push(dataIndex);
          }
        }
      }
    
      for(var i$2 = 0; i$2 < nodeDataSets.length; i$2++) {
        var nodeData$1 = nodeDataSets[i$2];
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
