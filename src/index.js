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
          node = node[term[j]];
          if(node === undefined) {
            continue exactOuter;
          }
        }

        const nodeData = node.data;
        if(nodeData !== undefined) {
          update(results, resultIndexes, increment, nodeData);
        }
      }

      const lastTerm = terms[exactTermsLength];
      let node = index;

      for(let i = 0; i < lastTerm.length; i++) {
        node = node[lastTerm[i]];
        if(node === undefined) {
          break;
        }
      }

      if(node !== undefined) {
        let nodeStack = [node];
        let childNode;
        while((childNode = nodeStack.pop())) {
          const childNodeData = childNode.data;
          if(childNodeData !== undefined) {
            update(results, resultIndexes, increment, childNodeData);
          }

          for(let char in childNode) {
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
  const dataLength = data.length;
  let index = {};
  let nodes = [];

  for(let i = 0; i < dataLength; i++) {
    const entry = processEntry(data[i]);
    if(entry.length !== 0) {
      const terms = getTerms(entry);
      const termsLength = terms.length;

      for(let j = 0; j < termsLength; j++) {
        const term = terms[j];
        const termLength = term.length - 1;
        let node = index;

        for(let n = 0; n < termLength; n++) {
          const char = term[n];
          let existingNode = node[char];

          if(existingNode === undefined) {
            existingNode = node[char] = {};
          }

          node = existingNode;
        }

        const lastChar = term[termLength];
        if(node[lastChar] === undefined) {
          node = node[lastChar] = {
            data: [1 / termsLength, i]
          };
          nodes.push(node);
        } else {
          node = node[lastChar];
          const nodeData = node.data;

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

  for(let i = 0; i < nodes.length; i++) {
    let nodeData = nodes[i].data;
    nodeData[0] = 1.5 - (nodeData[0] / dataLength);
  }

  return index;
}

Wade.save = function(search) {
  return search.index;
}

Wade.config = config;

Wade.version = "__VERSION__";
