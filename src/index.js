const whitespaceRE = /\s+/g;

let config = {
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
    const element = arr[i];

    if(element === undefined) {
      empty++;
    } else {
      let elementOutput;

      if(typeof element === "number") {
        elementOutput = element.toString();
      } else {
        elementOutput = stringify(element);
      }

      if(empty > 0) {
        output += separator + '@' + empty.toString();
        empty = 0;
        separator = ',';
      }

      output += separator + elementOutput;
      separator = ',';
    }
  }

  return output + ']';
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
  const relevance = data[0];
  for(let i = 1; i < data.length; i++) {
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
    const offset = index[0];
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
        let node = index;

        for(let j = 0; j < term.length; j++) {
          node = node[term.charCodeAt(j) + offset];
          if(node === undefined) {
            continue exactOuter;
          }
        }

        const nodeData = node[0];
        if(nodeData !== undefined) {
          update(results, resultIndexes, increment, nodeData);
        }
      }

      const lastTerm = terms[exactTermsLength];
      let node = index;

      for(let i = 0; i < lastTerm.length; i++) {
        node = node[lastTerm.charCodeAt(i) + offset];
        if(node === undefined) {
          break;
        }
      }

      if(node !== undefined) {
        let nodes = [node];
        for(let i = 0; i < nodes.length; i++) {
          let childNode = nodes[i];
          const childNodeData = childNode[0];

          if(childNodeData !== undefined) {
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

  if(Array.isArray(data) === true) {
    search.index = Wade.index(data);
  } else {
    search.index = data;
  }

  return search;
}

Wade.index = function(data) {
  let dataLength = 0;
  let minimumByte = 256;
  let maximumByte = -1;
  let processed = [];

  for(let i = 0; i < data.length; i++) {
    const entry = processEntry(data[i]);

    if(entry.length !== 0) {
      const terms = getTerms(entry);
      const termsLength = terms.length;

      for(let j = 0; j < termsLength; j++) {
        const term = terms[j];
        let processedTerm = [i];

        for(let n = 0; n < term.length; n++) {
          const char = term.charCodeAt(n);
          const highByte = char >>> 8;
          const lowByte = char & 0xFF;

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

  let offset = 1 - minimumByte;
  let size = maximumByte - minimumByte + 2;

  if(size < 0) {
    size = 1;
  }

  let nodeDataSets = [];
  let index = new Array(size);
  index[0] = offset;

  for(let i = 0; i < processed.length; i += 2) {
    const termsLength = processed[i];
    const processedTerm = processed[i + 1];
    const processedTermLength = processedTerm.length - 1;
    const dataIndex = processedTerm[0];
    let node = index;

    for(let j = 1; j < processedTermLength; j++) {
      const char = processedTerm[j] + offset;
      let existingNode = node[char];

      if(existingNode === undefined) {
        existingNode = node[char] = new Array(size);
      }

      node = existingNode;
    }

    const lastChar = processedTerm[processedTermLength] + offset;
    if(node[lastChar] === undefined) {
      node = node[lastChar] = new Array(size);
      nodeDataSets.push(node[0] = [1 / termsLength, dataIndex]);
    } else {
      node = node[lastChar];
      let nodeData = node[0];

      if(nodeData === undefined) {
        nodeDataSets.push(node[0] = [1 / termsLength, dataIndex]);
      } else {
        nodeData[0] += 1 / termsLength;
        nodeData.push(dataIndex);
      }
    }
  }

  for(let i = 0; i < nodeDataSets.length; i++) {
    let nodeData = nodeDataSets[i];
    nodeData[0] = 1.5 - (nodeData[0] / dataLength);
  }

  return index;
}

Wade.save = function(search) {
  return stringify(search.index);
}

Wade.config = config;

Wade.version = "__VERSION__";
