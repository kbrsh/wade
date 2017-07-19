# Wade

Blazing fast, 1kb search

[![Build Status](https://travis-ci.org/KingPixil/wade.svg?branch=master)](https://travis-ci.org/KingPixil/wade)

### Installation

NPM

```sh
npm install wade
```

CDN

```html
<script src="https://unpkg.com/wade"></script>
```

### Usage

Initialize with strings in the form of an array

```js
const search = Wade(["Apple", "Orange", "Lemon", "Tomato"]);
```

Now you can search for a substring within the array, and Wade will return the index of it.

```js
search("App");
/*
[{
  index: 0,
  score: 1
}]
*/
```

Combined with libraries like [Moon](http://moonjs.ga), you can create a simple real-time search.

### Loading/Saving Data

To save data as an object, use `Wade.save` on your search function, and then use these later when initializing Wade.

For example:

```js
// Create the initial search function
const search = Wade(["Apple", "Orange", "Lemon", "Tomato"]);
const instance = Wade.save(search);

// Save `instance` somewhere...
```

Later, you can get the same search function without having Wade recreate an index every time by doing:

```js
// Retrieve `instance`, then
const search = Wade(instance);
```

### Pipeline

Wade uses a pipeline to preprocess data and search queries. By default, this pipeline will:

* Make everything lowercase
* Remove punctuation
* Remove stop words

A pipeline consists of different functions that process a string and modify it in some way, and return the string.

You can easily modify the pipeline as it is available in `Wade.pipeline`, for example:

```js
// Don't preprocess at all
Wade.pipeline = [];

// Add custom processor to remove periods
Wade.pipeline.push(function(str) {
  return str.replace(/\./g, "");
});
```

All functions will be executed in the order of the pipeline (0-n) and they will be used on each document in the data.

The stop words can be configured to include any words you like, and you can access the array of stop words by using:

```js
Wade.config.stopWords = [/* array of stop words */];
```

### Algorithm

The algorithm behind the search is fairly simple. First, a trie data structure is generated off of the data. When performing a search, the following happens:

* The search query is processed through the pipeline
* The search query is then tokenized into keywords
* Each keyword except the last is searched for and scores for each item in the data are updated according to the amount of keywords that appear in the document.
* The last keyword is treated as a prefix, and Wade performs a depth-first search and updates the score for all data prefixed with this keyword. The score is added depending on how much of the word was included in the prefix. This allows for searching as a user types.

### License

Licensed under the [MIT License](https://kingpixil.github.io/license) by [Kabir Shah](https://kabir.ml)
