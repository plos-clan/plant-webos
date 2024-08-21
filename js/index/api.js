
var apis = {};

window.addEventListener('message', function (e) {
  var winfo = find_window_by_iframe_content(e.source);
  if (winfo || e.source === desktop.iframe[0].contentWindow) {
    apis[e.data.api](winfo, e.data);
  }
});

apis.openFile = function (winfo, data) {
  createWindow(data.name, 100, 100, 500, 400, data.file);
};
apis.openDir = function (winfo, data) {
  createWindow(data.name, 100, 100, 500, 400, 'app/file-manager.html?path=' + data.file);
};

apis.close = function (winfo, data) {
  if (winfo === undefined) return;
  winfo.close();
};

apis.rename = function (winfo, data) {
  if (winfo === undefined) return;
  winfo.rename(data.title);
};

apis.setIcon = function (winfo, data) {
  if (winfo === undefined) return;
  winfo.icon = data.icon;
  if (winfo.element.icon !== undefined) {
    winfo.element.icon.attr('src', data.icon).show();
    if (data.icon === undefined || data.icon === null) winfo.elememt.icon.hide();
  }
  updateTaskbar();
};
