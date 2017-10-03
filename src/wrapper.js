(function(root, factory) {
  /* ======= Global Wade ======= */
  if(typeof module === "undefined") {
    root.Wade = factory();
  } else {
    module.exports = factory();
  }
}(this, function() {
    //=require ./index.js
    return Wade;
}));
