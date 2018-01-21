const whitespaceRE = /\s+/g;

let config = {
  stopWords: ["about", "after", "all", "also", "am", "an", "and", "another", "any", "are", "as", "at", "be", "because", "been", "before", "being", "between", "both", "but", "by", "came", "can", "come", "could", "did", "do", "each", "for", "from", "get", "got", "has", "had", "he", "have", "her", "here", "him", "himself", "his", "how", "if", "in", "into", "is", "it", "like", "make", "many", "me", "might", "more", "most", "much", "must", "my", "never", "now", "of", "on", "only", "or", "other", "our", "out", "over", "said", "same", "see", "should", "since", "some", "still", "such", "take", "than", "that", "the", "their", "them", "then", "there", "these", "they", "this", "those", "through", "to", "too", "under", "up", "very", "was", "way", "we", "well", "were", "what", "where", "which", "while", "who", "with", "would", "you", "your", "a", "i"],
  punctuationRE: /[@!"',.:;?\(\)\[\]]/g,
  processors: [
    function(entry) {
      return entry.toLowerCase();
    },
    function(entry) {
      return entry.replace(config.punctuationRE, '');
    },
    function(entry) {
      const stopWords = config.stopWords;
      let terms = getTerms(entry);
      let i = terms.length;

      while((i--) !== 0) {
        if(stopWords.indexOf(terms[i]) !== -1) {
          terms.splice(i, 1);
        }
      }

      return terms.join(' ');
    }
  ]
};

const stringify = function(arr) {
  let output = '[';
  let separator = '';
  let empty = 0;

  for(let i = 0; i < arr.length; i++) {
    let element = arr[i];

    if(element === undefined) {
      empty++;
    } else {
      if(typeof element !== "number") {
        element = stringify(element);
      }

      if(empty > 0) {
        output += separator + '@' + empty;
        empty = 0;
        separator = ',';
      }

      output += separator + element;
      separator = ',';
    }
  }

  return output + ']';
}

const parse = function(str) {
  let arr = [];
  let stack = [arr];
  let currentIndex = 1;

  while(stack.length !== 0) {
    let currentArr = stack[stack.length - 1];
    let element = '';

    for(; currentIndex < str.length; currentIndex++) {
      const char = str[currentIndex];
      if(char === ',') {
        if(element.length !== 0) {
          if(element[0] === '@') {
            const elementInt = parseInt(element.substring(1));
            for(let i = 0; i < elementInt; i++) {
              currentArr.push(undefined);
            }
          } else {
            currentArr.push(parseFloat(element));
          }
          element = '';
        }
      } else if(char === '[') {
        let childArr = [];
        currentArr.push(childArr);
        stack.push(childArr);
        currentIndex++;
        break;
      } else if(char === ']') {
        stack.pop();
        currentIndex++;
        break;
      } else {
        element += char;
      }
    }

    if(element.length !== 0) {
      currentArr.push(parseInt(element));
    }
  }

  return arr;
}

const getTerms = function(entry) {
  let terms = entry.split(whitespaceRE);

  if(terms[0].length === 0) {
    terms.shift();
  }

  if(terms[terms.length - 1].length === 0) {
    terms.pop();
  }

  return terms;
}

const processEntry = function(entry) {
  if(entry.length === 0) {
    return entry;
  } else {
    const processors = config.processors;

    for(let i = 0; i < processors.length; i++) {
      entry = processors[i](entry);
    }

    return entry;
  }
}

const update = function(results, resultIndexes, increment, data) {
  const relevance = data[1];
  for(let i = 2; i < data.length; i++) {
    const index = data[i];
    const resultIndex = resultIndexes[index];
    if(resultIndex === undefined) {
      const lastIndex = results.length;
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

const Wade = function(data) {
  const search = function(query) {
    const index = search.index;
    const processed = processEntry(query);
    let results = [];
    let resultIndexes = {};

    if(processed.length === 0) {
      return results;
    } else {
      const terms = getTerms(processed);
      const termsLength = terms.length;
      const exactTermsLength = termsLength - 1;
      const increment = 1 / termsLength;

      exactOuter: for(let i = 0; i < exactTermsLength; i++) {
        const term = terms[i];
        const termLength = term.length - 1;
        let node = index;

        for(let j = 0; j <= termLength; j++) {
          const termOffset = node[0][0];
          const termIndex = term.charCodeAt(j) + termOffset;

          if(termIndex < 1 || (termOffset === undefined && j === termLength) || node[termIndex] === undefined) {
            continue exactOuter;
          }

          node = node[termIndex];
        }

        const nodeData = node[0];
        if(nodeData.length !== 1) {
          update(results, resultIndexes, increment, nodeData);
        }
      }

      const lastTerm = terms[exactTermsLength];
      const lastTermLength = lastTerm.length - 1;
      let node = index;

      for(let i = 0; i <= lastTermLength; i++) {
        const lastTermOffset = node[0][0];
        const lastTermIndex = lastTerm.charCodeAt(i) + lastTermOffset;

        if(lastTermIndex < 1 || (lastTermOffset === undefined && i === lastTermLength) || node[lastTermIndex] === undefined) {
          break;
        }

        node = node[lastTermIndex];
      }

      if(node !== undefined) {
        let nodes = [node];
        for(let i = 0; i < nodes.length; i++) {
          let childNode = nodes[i];
          const childNodeData = childNode[0];

          if(childNodeData.length !== 1) {
            update(results, resultIndexes, increment, childNodeData);
          }

          for(let j = 1; j < childNode.length; j++) {
            const grandChildNode = childNode[j];
            if(grandChildNode !== undefined) {
              nodes.push(grandChildNode);
            }
          }
        }
      }

      return results;
    }
  }

  if(Array.isArray(data)) {
    search.index = Wade.index(data);
  } else {
    search.index = parse(data);
  }

  return search;
}

Wade.index = function(data) {
  let dataLength = 0;
  let ranges = {};
  let processed = [];

  for(let i = 0; i < data.length; i++) {
    const entry = processEntry(data[i]);

    if(entry.length !== 0) {
      const terms = getTerms(entry);
      const termsLength = terms.length;

      for(let j = 0; j < termsLength; j++) {
        const term = terms[j];
        let processedTerm = [];
        let currentRanges = ranges;

        for(let n = 0; n < term.length; n++) {
          const char = term.charCodeAt(n);
          const highByte = char >>> 8;
          const lowByte = char & 0xFF;

          if(highByte !== 0) {
            if(currentRanges.minimum === undefined || highByte < currentRanges.minimum) {
              currentRanges.minimum = highByte;
            }

            if(currentRanges.maximum === undefined || highByte > currentRanges.maximum) {
              currentRanges.maximum = highByte;
            }

            let nextRanges = currentRanges[highByte];
            if(nextRanges === undefined) {
              currentRanges = currentRanges[highByte] = {};
            } else {
              currentRanges = nextRanges;
            }

            processedTerm.push(highByte);
          }

          if(currentRanges.minimum === undefined || lowByte < currentRanges.minimum) {
            currentRanges.minimum = lowByte;
          }

          if(currentRanges.maximum === undefined || lowByte > currentRanges.maximum) {
            currentRanges.maximum = lowByte;
          }

          let nextRanges = currentRanges[lowByte];
          if(nextRanges === undefined) {
            currentRanges = currentRanges[lowByte] = {};
          } else {
            currentRanges = nextRanges;
          }

          processedTerm.push(lowByte);
        }

        processed.push(i);
        processed.push(termsLength);
        processed.push(processedTerm);
      }
    }

    dataLength++;
  }

  const indexMinimum = ranges.minimum;
  const indexMaximum = ranges.maximum;
  let indexSize = 1;
  let indexOffset;

  if(indexMinimum !== undefined && indexMaximum !== undefined) {
    indexSize = indexMaximum - indexMinimum + 2;
    indexOffset = 1 - indexMinimum;
  }

  let nodeDataSets = [];
  let index = new Array(indexSize);
  index[0] = [indexOffset];

  for(let i = 0; i < processed.length; i += 3) {
    const dataIndex = processed[i];
    const termsLength = processed[i + 1];
    const processedTerm = processed[i + 2];
    const processedTermLength = processedTerm.length - 1;
    let node = index;
    let termRanges = ranges;

    for(let j = 0; j < processedTermLength; j++) {
      const char = processedTerm[j];
      const charIndex = char + node[0][0];
      let termNode = node[charIndex];
      termRanges = termRanges[char];

      if(termNode === undefined) {
        const termMinimum = termRanges.minimum;
        const termMaximum = termRanges.maximum;
        termNode = node[charIndex] = new Array(termMaximum - termMinimum + 2);
        termNode[0] = [1 - termMinimum];
      }

      node = termNode;
    }

    const lastChar = processedTerm[processedTermLength];
    const lastCharIndex = lastChar + node[0][0]
    let lastTermNode = node[lastCharIndex];
    termRanges = termRanges[lastChar];

    if(lastTermNode === undefined) {
      const lastTermMinimum = termRanges.minimum;
      const lastTermMaximum = termRanges.maximum;
      let lastTermSize = 1;
      let lastTermOffset;

      if(lastTermMinimum !== undefined && lastTermMaximum !== undefined) {
        lastTermSize = lastTermMaximum - lastTermMinimum + 2;
        lastTermOffset = 1 - lastTermMinimum;
      }

      lastTermNode = node[lastCharIndex] = new Array(lastTermSize);
      nodeDataSets.push(lastTermNode[0] = [lastTermOffset, 1 / termsLength, dataIndex]);
    } else {
      let nodeData = lastTermNode[0];

      if(nodeData.length === 1) {
        nodeData.push(1 / termsLength);
        nodeData.push(dataIndex);
        nodeDataSets.push(nodeData);
      } else {
        nodeData[1] += 1 / termsLength;
        nodeData.push(dataIndex);
      }
    }
  }

  for(let i = 0; i < nodeDataSets.length; i++) {
    let nodeData = nodeDataSets[i];
    nodeData[1] = 1.5 - (nodeData[1] / dataLength);
  }

  return index;
}

Wade.save = function(search) {
  return stringify(search.index);
}

Wade.config = config;

Wade.version = "__VERSION__";
