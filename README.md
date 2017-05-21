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
// => 0 (Index of "Apple")
```

Combined with libraries like [Moon](http://moonjs.ga), you can create a simple real-time search.

### License

Licensed under the [MIT License](https://kingpixil.github.io/license) by [Kabir Shah](https://kabir.ml)
