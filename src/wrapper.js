(function(root, factory) {
  /* ======= Global Wade ======= */
  if(typeof module === "undefined") {
    root.Wade = factory();
  } else {
    module.exports = factory();
  }
}(this, function() {
    //=require ../dist/wade.js
    return Wade;
}));
