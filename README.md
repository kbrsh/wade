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

### Pipeline

Wade uses a pipeline to preprocess data and search queries. By default, this pipeline will:

* Make everything lowercase
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
