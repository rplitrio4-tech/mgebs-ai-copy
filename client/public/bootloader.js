(function () {
  var script = document.createElement('script');
  script.type = 'module';
  script.crossOrigin = 'anonymous';
  script.src = '/_spa/assets/index-w64_zsxD.js?standalone=1';
  script.onerror = function () {
    window.dispatchEvent(new CustomEvent('mgebs-bundle-error'));
  };
  document.head.appendChild(script);
})();
