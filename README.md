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

Initialize Wade with an array of data.

```js
const search = Wade(["Apple", "Lemon", "Orange", "Tomato"]);
```

Now you can search for a query within the data, and Wade will return results. Each result will include the index of the item in the data it corresponds to along with a score depending on the relevance of the query to the result.

```js
search("App");

/*
  [{
    index: 0,
    score: 1.25
  }]
*/
```

Combined with JavaScript libraries like [Moon](http://moonjs.ga), you can create a [real-time search](http://moonjs.ga/examples/search/index.html).

### Loading/Saving Index

To save an index as a String, use `Wade.save` on a search function.

For example:

```js
// Create the search function
const search = Wade(["Apple", "Lemon", "Orange", "Tomato"]);
const index = Wade.save(search);

// Save `index`
```

Later, you can get the same search function without having Wade recreate an index every time by doing:

```js
// Retrieve `index`, then
const search = Wade(index);
```

`index` is a String and can be saved to a file.

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

First, an index is generated from the data. When performing a search, the following happens:

* The search query is processed.
* The search query is tokenized into terms.
* Each term except the last is searched for exactly and scores for each item in the data are updated according to the relevance of the term to the data.
* The last keyword is treated as a prefix, and Wade performs a depth-first search and updates the score for all data prefixed with this term using the relevance weight for the term. This allows for searching as a user types.

In-depth explanations of the algorithm are available on the [blog post](https://blog.kabir.ml/posts/inside-wade.html) and [pdf](https://github.com/kbrsh/wade/blob/master/Wade.pdf).

### Support

Support Wade [on Patreon](https://patreon.com/kbrsh) to help sustain the development of the project. The maker of the project works on open source for free. If you or your company depend on this project, then it makes sense to donate to ensure that the project is maintained.

### License

Licensed under the [MIT License](https://kbrsh.github.io/license) by [Kabir Shah](https://kabir.ml)
