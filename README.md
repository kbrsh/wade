# Wade

Blazing fast 1kb search

[![Build Status](https://travis-ci.org/kbrsh/wade.svg?branch=master)](https://travis-ci.org/kbrsh/wade)

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

Initialize Wade with an array of strings.

```js
const search = Wade(["Apple", "Lemon", "Orange", "Tomato"]);
```

Now you can search for a query within the array, and Wade will return the index of it, along with a score.

```js
search("App");
/*
[{
  index: 0,
  score: 1.25
}]
*/
```

Combined with libraries like [Moon](http://moonjs.ga), you can create a [real-time search](http://moonjs.ga/examples/search/index.html).

### Loading/Saving Data

To save data as an object, use `Wade.save` on your search function, and then use these later when initializing Wade.

For example:

```js
// Create the initial search function
const search = Wade(["Apple", "Lemon", "Orange", "Tomato"]);
const instance = Wade.save(search);

// Save `instance`
```

Later, you can get the same search function without having Wade recreate an index every time by doing:

```js
// Retrieve `instance`, then
const search = Wade(instance);
```

`instance` can be saved to a file using using `JSON.stringify()` and loaded with `JSON.parse()`.

### Processors

Wade uses a set of processors to preprocess data and search queries. By default, these will:

* Make everything lowercase
* Remove punctuation
* Remove stop words

A process consists of different functions that process a string and modify it in some way, and return the transformed string.

You can easily modify the processors as they are available in `Wade.config.processors`, for example:

```js
// Don't preprocess at all
Wade.config.processors = [];

// Add custom processor to remove periods
Wade.config.processors.push(function(str) {
  return str.replace(/\./g, "");
});
```

All functions will be executed in the order of the array (0-n) and they will be used on each document in the data.

The stop words can be configured to include any words you like, and you can access the array of stop words by using:

```js
Wade.config.stopWords = [/* array of stop words */];
```

The punctuation regular expression used to remove punctuation can be configured with:

```js
Wade.config.punctuationRE = /[.!]/g; // should contain punctuation to remove
```

### Algorithm

The algorithm behind the search is fairly simple. First, a trie data structure is generated off of the data. When performing a search, the following happens:

* The search query is processed.
* The search query is tokenized into keywords.
* Each keyword except the last is searched for and scores for each item in the data are updated according to the amount of keywords that appear in the document.
* The last keyword is treated as a prefix, and Wade performs a depth-first search and updates the score for all data prefixed with this keyword. The score is added depending on how much of the word was included in the prefix, and how relevant the word is to the data. This allows for searching as a user types.

In-depth explanations of the algorithm are available on the [blog post](https://blog.kabir.ml/posts/inside-wade.html) and [pdf](https://github.com/kbrsh/wade/blob/master/Wade.pdf).

### License

Licensed under the [MIT License](https://kbrsh.github.io/license) by [Kabir Shah](https://kabir.ml)
