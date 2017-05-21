var createTable = function(item, length) {
	var table = {};

  for(var i = 0; i < length - 1; i++) {
  	table[item[i]] = length - i - 1;
  }

  return table;
}

var contains = function(item, itemLength, table, data) {
  var dataLength = data.length;

  var i = 0;
  var length = dataLength - itemLength + 1;

  var match = false;

  if(itemLength !== 0) {
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
    var keywords = Wade.process(item).split(" ");
    var keywordsLength = keywords.length;
    var lengths = new Array(keywordsLength);
    var tables = new Array(keywordsLength);
    var results = [];

    for(var i = 0; i < keywordsLength; i++) {
      var keyword = keywords[i];
      var length = keyword.length;
      lengths[i] = length;
      tables[i] = createTable(keyword, length);
    }

    for(var i = 0; i < data.length; i++) {
      var score = 0;
      var chunk = data[i];

      for(var j = 0; j < keywordsLength; j++) {
        if(contains(keywords[j], lengths[j], tables[j], chunk) === true) {
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
