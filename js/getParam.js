const getParam = (function () {
  var url = window.location.href;

  var querySplit = url.split('?');
  if (querySplit.length < 2) return name => undefined;

  var queryString = querySplit[1];
  if (!queryString) return name => undefined;

  var queryParams = queryString.split('&');
  var params = {};

  for (var i = 0; i < queryParams.length; i++) {
    var pair = queryParams[i].split('=');
    var key = decodeURIComponent(pair[0]);
    var value = decodeURIComponent(pair[1]);
    params[key] = value;
  }

  return name => params[name];
})();