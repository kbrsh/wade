(function(root, factory) {
  /* ======= Global Wade ======= */
  (typeof module === "object" && module.exports) ? module.exports = factory() : root.Wade = factory();
}(this, function() {
    //=require ./index.js
    return Wade;
}));
