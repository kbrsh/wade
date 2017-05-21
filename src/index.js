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

var Wade = function(data) {
  var search = function(item) {
    var data = search.data;
    var keywords = item.split(" ");
    var keywordsLength = keywords.length;
    var lengths = new Array(keywordsLength);
    var tables = new Array(keywordsLength);
    var results = [];

    for(var i = 0; i < keywordsLength; i++) {
      var keyword = keywords[i];
      lengths[i] = keyword.length;
      tables[i] = createTable(keyword);
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

Wade.version = "__VERSION__";
