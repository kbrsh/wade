const whitespaceRE = /\s+/g;

let config = {
  stopWords: ["about", "after", "all", "also", "am", "an", "and", "another", "any", "are", "as", "at", "be", "because", "been", "before", "being", "between", "both", "but", "by", "came", "can", "come", "could", "did", "do", "each", "for", "from", "get", "got", "has", "had", "he", "have", "her", "here", "him", "himself", "his", "how", "if", "in", "into", "is", "it", "like", "make", "many", "me", "might", "more", "most", "much", "must", "my", "never", "now", "of", "on", "only", "or", "other", "our", "out", "over", "said", "same", "see", "should", "since", "some", "still", "such", "take", "than", "that", "the", "their", "them", "then", "there", "these", "they", "this", "those", "through", "to", "too", "under", "up", "very", "was", "way", "we", "well", "were", "what", "where", "which", "while", "who", "with", "would", "you", "your", "a", "i"],
  punctuationRE: /[.,!?:;"']/g
};

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

const getTerms = function(str) {
  let terms = str.split(whitespaceRE);

  if(terms[0].length === 0) {
    terms.shift();
  }

  if(terms[terms.length - 1].length === 0) {
    terms.pop();
  }

  return terms;
}

const lowercase = function(str) {
  return str.toLowerCase();
}

const removePunctuation = function(str) {
  return str.replace(config.punctuationRE, '');
}

const removeStopWords = function(str) {
  const stopWords = config.stopWords;
  let terms = getTerms(str);
  let i = terms.length;

  while((i--) !== 0) {
    if(stopWords.indexOf(terms[i]) !== -1) {
      terms.splice(i, 1);
    }
  }

  return terms.join(' ');
}

const Wade = function(data) {
  const search = function(item) {
    const index = search.index;
    const terms = getTerms(item);
    const termsLength = terms.length;
    const exactTermsLength = termsLength - 1;
    const increment = 1 / termsLength;
    let results = [];
    let resultIndexes = {};

    if(termsLength === 0) {
      return results;
    } else {
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
        const existingNode = node[lastTerm[i]];
        if(existingNode === undefined) {
          break;
        } else {
          node = existingNode;
        }
      }

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


      return results;
    }
  }

  if(Array.isArray(data) === true) {
    const dataLength = data.length;
    let normalizedData = [];

    for(let i = 0; i < dataLength; i++) {
      const item = Wade.process(data[i]);
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
  const pipeline = Wade.pipeline;

  for(let i = 0; i < pipeline.length; i++) {
    item = pipeline[i](item);
  }

  return item;
}

Wade.index = function(data) {
  const dataLength = data.length;
  let index = {};
  let termsLengths = [];
  let nodes = [];

  for(let i = 0; i < dataLength; i++) {
    const terms = getTerms(data[i]);
    const termsLength = terms.length;

    termsLengths.push(termsLength);

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
          data: [1, i]
        };
        nodes.push(node);
      } else {
        node = node[lastChar];
        const nodeData = node.data;

        if(nodeData === undefined) {
          node.data = [1, i];
          nodes.push(node);
        } else {
          nodeData.push(i);
        }
      }
    }
  }

  for(let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    let nodeData = node.data;
    let currentLength = 1;
    let currentAverage = 0;

    for(let j = 1; j < nodeData.length; j++) {
      const dataIndex = nodeData[j];
      if(nodeData[j + 1] === dataIndex) {
        currentLength++;
      } else {
        currentAverage += currentLength / termsLengths[dataIndex];
        currentLength = 1;
      }
    }

    nodeData[0] = 1.5 - (currentAverage / dataLength);
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

Wade.version = "__VERSION__";
