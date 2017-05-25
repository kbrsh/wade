# Wade

Blazing fast, 1kb search

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

### Algorithm

The algorithm behind the search is fairly simple. First, a trie data structure is generated off of the data. When performing a search, the following happens:

* The search query is processed through the pipeline
* The search query is then tokenized into keywords
* Each keyword except the last is searched for and scores for each item in the data are updated according to the amount of keywords that appear in the document.
* The last keyword is treated as a prefix, and Wade performs a depth-first search and updates the score for all data prefixed with this keyword. The score is added depending on how much of the word was included in the prefix. This allows for searching as a user types.

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

### License

Licensed under the [MIT License](https://kingpixil.github.io/license) by [Kabir Shah](https://kabir.ml)
