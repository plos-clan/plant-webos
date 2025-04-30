
function apiOpenFile(name, path) {
  window.parent.postMessage({ api: 'openFile', name: name, file: path }, '*');
}

function apiOpenDir(name, path) {
  window.parent.postMessage({ api: 'openDir', name: name, file: path }, '*');
}

function apiClose() {
  window.parent.postMessage({ api: 'close' }, '*');
}

function apiSetIcon(icon) {
  window.parent.postMessage({ api: 'setIcon', icon: icon }, '*');
}

