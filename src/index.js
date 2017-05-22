var containsChar = function(item, data) {
  var match = false;
  for(var i = 0; i < data.length; i++) {
    if(item === data[i]) {
      match = true;
    }
  }
  return match;
}

var createSinglePatternTable = function(item, length) {
	var table = {};

  for(var i = 0; i < length - 1; i++) {
  	table[item[i]] = length - i - 1;
  }

  return table;
}

var containsPattern = function(item, itemLength, table, data) {
  var dataLength = data.length;

  var i = 0;
  var length = dataLength - itemLength + 1;

  var match = false;

  while(i < length) {
    for(var j = itemLength - 1; j >= 0; j--) {
      var char = item[j];
      var target = data[j + i];

      if(char === target) {
        match = true;
      } else {
        var shift = table[target];

        if(shift === undefined) {
          i += j + 1;
        } else {
          i += shift;
        }

        match = false;
        break;
      }
    }

    if(match === true) {
      break;
    }
  }

  return match;
}

var addMultiplePatternTrie = function(parent, id, item) {
  var node = parent;
	for(var i = item.length - 1; i > 0; i--) {
    var newNode = node[item[i]];
    newNode = newNode === undefined ? {} : newNode;
  	node[item[i]] = newNode;
    node = newNode;
  }

  node[item[0]] = {
    id: id
  }
}

var addMultiplePatternTable = function(table, trie) {

}

var containsMultiplePatterns = function(items, itemLength, trie, table, data) {
  var dataLength = data.length;

  var i = 0;
  var length = dataLength - itemLength + 1;

  var match = false;

  while(i < length) {
    var node = trie;
    for(var j = itemLength - 1; j >= 0; j--) {
      var target = data[j + i];

      if(node[target] !== undefined) {
        node = node[target];
        match = true;
      } else {
        i++;
        match = false;
        break;
      }
    }

    if(match === true) {
      break;
    }
  }

  return match;
}

var lowercase = function(str) {
  return str.toLowerCase();
}

var stopWords = ['about', 'after', 'all', 'also', 'am', 'an', 'and', 'another', 'any', 'are', 'as', 'at', 'be', 'because', 'been', 'before', 'being', 'between', 'both', 'but', 'by', 'came', 'can', 'come', 'could', 'did', 'do', 'each', 'for', 'from', 'get', 'got', 'has', 'had', 'he', 'have', 'her', 'here', 'him', 'himself', 'his', 'how', 'if', 'in', 'into', 'is', 'it', 'like', 'make', 'many', 'me', 'might', 'more', 'most', 'much', 'must', 'my', 'never', 'now', 'of', 'on', 'only', 'or', 'other', 'our', 'out', 'over', 'said', 'same', 'see', 'should', 'since', 'some', 'still', 'such', 'take', 'than', 'that', 'the', 'their', 'them', 'then', 'there', 'these', 'they', 'this', 'those', 'through', 'to', 'too', 'under', 'up', 'very', 'was', 'way', 'we', 'well', 'were', 'what', 'where', 'which', 'while', 'who', 'with', 'would', 'you', 'your', 'a', 'i'];

var removeStopWords = function(str) {
  var words = str.split(" ");

  for(var i = 0; i < words.length; i++) {
    if(stopWords.indexOf(words[i]) !== -1) {
      words.splice(i, 1);
    }
  }

  return words.join(" ");
}

var Wade = function(data) {
  var search = function(item) {
    var data = search.data;
    var dataLength = data.length;
    var keywords = Wade.process(item).split(" ");
    var keywordsLength = keywords.length;
    var results = [];

    if(keywordsLength === 1) {
      var keyword = keywords[0];
      var keywordLength = keyword.length;

      if(keywordLength === 1) {
        for(var i = 0; i < dataLength; i++) {
          if(containsChar(keyword, data[i]) === true) {
            results.push({
              index: i,
              score: 1
            });
          }
        }
      } else if(keywordLength > 1) {
        var table = createSinglePatternTable(keyword, keywordLength);
        for(var i = 0; i < dataLength; i++) {
          if(containsPattern(keyword, keywordLength, table, data[i]) === true) {
            results.push({
              index: i,
              score: 1
            });
          }
        }
      }

    } else {
      var trie = {};
      var table = {};
      var itemLength = 0;
      for(var i = 0; i < keywordsLength; i++) {
        var keyword = keywords[i];
        var keywordLength = keyword.length;
        if(keywordLength > itemLength) {
          itemLength = keywordLength;
        }
        addMultiplePatternTrie(trie, i, keyword);
      }
      addMultiplePatternTable(table, trie);
      for(var i = 0; i < dataLength; i++) {
        if(containsMultiplePatterns(keywords[i], itemLength, trie, table, data[i]) === true) {
          results.push({
            index: i,
            score: 1
          });
        }
      }
    }

    return results;
  }

  for(var i = 0; i < data.length; i++) {
    data[i] = Wade.process(data[i]);
  }

  search.data = data;

  return search;
}

Wade.pipeline = [lowercase, removeStopWords];

Wade.process = function(item) {
  var pipeline = Wade.pipeline;

  for(var j = 0; j < pipeline.length; j++) {
    item = pipeline[j](item);
  }

  return item;
}

Wade.version = "__VERSION__";
