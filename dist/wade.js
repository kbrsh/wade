/**
 * Wade v0.2.0
 * Copyright 2017 Kabir Shah
 * Released under the MIT License
 */

(function(root, factory) {
  /* ======= Global Wade ======= */
  (typeof module === "object" && module.exports) ? module.exports = factory() : root.Wade = factory();
}(this, function() {
    var stopWords = ['about', 'after', 'all', 'also', 'am', 'an', 'and', 'another', 'any', 'are', 'as', 'at', 'be', 'because', 'been', 'before', 'being', 'between', 'both', 'but', 'by', 'came', 'can', 'come', 'could', 'did', 'do', 'each', 'for', 'from', 'get', 'got', 'has', 'had', 'he', 'have', 'her', 'here', 'him', 'himself', 'his', 'how', 'if', 'in', 'into', 'is', 'it', 'like', 'make', 'many', 'me', 'might', 'more', 'most', 'much', 'must', 'my', 'never', 'now', 'of', 'on', 'only', 'or', 'other', 'our', 'out', 'over', 'said', 'same', 'see', 'should', 'since', 'some', 'still', 'such', 'take', 'than', 'that', 'the', 'their', 'them', 'then', 'there', 'these', 'they', 'this', 'those', 'through', 'to', 'too', 'under', 'up', 'very', 'was', 'way', 'we', 'well', 'were', 'what', 'where', 'which', 'while', 'who', 'with', 'would', 'you', 'your', 'a', 'i'];
    var punctuationRE = /\.|\,|\!/g;
    
    var lowercase = function(str) {
      return str.toLowerCase();
    }
    
    var removePunctuation = function(str) {
      return str.replace(punctuationRE, "");
    }
    
    var removeStopWords = function(str) {
      var words = str.split(" ");
    
      for(var i = 0; i < words.length; i++) {
        if(stopWords.indexOf(words[i]) !== -1) {
          words.splice(i, 1);
        }
      }
    
      return words;
    }
    
    var Wade = function(data) {
      var search = function(item) {
        var data = search.data;
        var dataLength = data.length;
        var keywords = Wade.process(item).split(" ");
        var keywordsLength = keywords.length;
        var results = [];
    
        return results;
      }
    
      for(var i = 0; i < data.length; i++) {
        data[i] = Wade.process(data[i]);
      }
    
      search.index = Wade.index(data);
      search.data = data;
    
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
      var tree = {};
      for(var i = 0; i < data.length; i++) {
        var str = data[i];
        for(var j = 0; j < str.length; j++) {
          var item = str[j];
          var itemLength = item.length - 1;
          var node = tree;
          for(var n = 0; n < itemLength; n++) {
            var char = item[n];
            var newNode = node[char];
            newNode = newNode === undefined ? {} : newNode;
            node[char] = newNode;
          }
          node[item[itemLength]] = {
            id: i
          }
        }
      }
      return tree;
    }
    
    Wade.version = "0.2.0";
    
    return Wade;
}));
