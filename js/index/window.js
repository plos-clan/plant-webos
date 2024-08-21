
var screen_w, screen_h;
var desktop_w, desktop_h;

function updete_screen_size() {
  screen_w = document.documentElement.clientWidth;
  screen_h = document.documentElement.clientHeight;
  desktop_w = screen_w;
  desktop_h = screen_h - taskbarElement.height() - 2 * parseInt(taskbarElement.css('padding'), 10);
}

new ResizeObserver(function () { updete_screen_size(); }).observe(document.documentElement);

var desktop;
var window_list = {};
var next_window_id = 0;
var next_z_index = 1;

const window_resize_area_width = 10;

function find_window_by_iframe_content(iframe_content) {
  for (let winfo of Object.values(window_list)) {
    if (winfo.element.iframe[0].contentWindow === iframe_content) {
      return winfo;
    }
  }
  return undefined;
}

function find_window_by_id(id) {
  return window_list[id];
}

function window_mask_all() {
  for (let winfo of Object.values(window_list)) {
    winfo.mask();
  }
  desktop.mask.css('pointer-events', 'auto');
}

function window_unmask_all() {
  for (let winfo of Object.values(window_list)) {
    winfo.unmask();
  }
  desktop.mask.css('pointer-events', 'none');
}

function createDesktop(content) {
  var iframe = $('<iframe src="' + content + '" class="desktop-iframe"></iframe>');
  var mask = $('<div class="content-transparent-mask"></div>');
  var content = $('<div class="content"></div>').html([iframe, mask]);
  desktop = { "iframe": iframe, "mask": mask, "content": content };

  content.position({ left: 0, top: 0 });
  content.width($(document).width());
  content.height($(document).height() - taskbarElement.height() - 2 * parseInt(taskbarElement.css('padding'), 10));

  new ResizeObserver(function () {
    content.width($(document).width());
    content.height($(document).height() - taskbarElement.height() - 2 * parseInt(taskbarElement.css('padding'), 10));
  }).observe(document.documentElement);

  $('body').append(content);
}

function window_init(winfo) {
  const resize = winfo.element.resize;
  const window = winfo.element.window;
  const iframe = winfo.element.iframe;
  const header = winfo.element.header;
  const mask = winfo.element.mask;
  const maximizeButton = winfo.element.maximize;
  const restoreButton = winfo.element.restore;

  const window_move_animate_time = 250;

  winfo.close = function () {
    window.remove();
    if (resize !== undefined) resize.remove();
    delete window_list[winfo.id];
    updateTaskbar();
  };

  winfo.show = function () {
    if (resize !== undefined) resize.show();
    window.show();
  };

  winfo.hide = function () {
    if (resize !== undefined) resize.hide();
    window.hide();
  };

  winfo.active = function () {
    if (winfo.minimized === true) {
      winfo.minimized = false;
      winfo.show();
      winfo.setpos_animate(winfo.x, winfo.y, winfo.width, winfo.height);
    }
    if (resize !== undefined) resize.css('z-index', next_z_index++);
    window.css('z-index', next_z_index++);
  };

  winfo.stop_animate = function (jumpToEnd = true) {
    if (resize !== undefined) resize.stop(true, jumpToEnd);
    window.stop(true, jumpToEnd);
  };

  winfo.resize = function (w, h, safe = true) {
    if (safe === true) {
      if (w < 300 || h < 200) return;
    }
    winfo.stop_animate();
    if (resize !== undefined) {
      resize.width(w + 2 * window_resize_area_width);
      resize.height(h + 2 * window_resize_area_width);
    }
    window.width(w);
    window.height(h);
    iframe.css('width', '100%');
  };

  winfo.moveto = function (x, y) {
    winfo.stop_animate();
    if (resize !== undefined) {
      resize.offset({ top: y - window_resize_area_width, left: x - window_resize_area_width });
    }
    window.offset({ top: y, left: x });
  };

  winfo.setpos = function (x, y, w, h, safe = true) {
    if (safe === true) {
      if (w < 300 || h < 200) return;
    }
    winfo.stop_animate();
    if (resize !== undefined) {
      resize.offset({ top: y - window_resize_area_width, left: x - window_resize_area_width });
      resize.width(w + 2 * window_resize_area_width);
      resize.height(h + 2 * window_resize_area_width);
    }
    window.offset({ top: y, left: x });
    window.width(w);
    window.height(h);
    iframe.css('width', '100%');
  };

  winfo.moveto_animate = function (x, y, complete = function () { }) {
    winfo.stop_animate(false);
    if (resize !== undefined) {
      resize.animate({ top: y - window_resize_area_width + 'px', left: x - window_resize_area_width + 'px' }, window_move_animate_time);
    }
    window.animate({ top: y + 'px', left: x + 'px' }, window_move_animate_time, complete);
  };

  winfo.setpos_animate = function (x, y, w, h, complete = function () { }) {
    winfo.stop_animate(false);
    if (resize !== undefined)
      resize.animate({
        left: x - window_resize_area_width + 'px',
        top: y - window_resize_area_width + 'px',
        width: w + 2 * window_resize_area_width + 'px',
        height: h + 2 * window_resize_area_width + 'px'
      }, window_move_animate_time);
    window.animate({
      left: x + 'px',
      top: y + 'px',
      width: w + 'px',
      height: h + 'px'
    }, window_move_animate_time, complete);
    if (w < 300 && winfo.real_w >= 300) {
      setTimeout(function () {
        iframe.css('width', '300px');
      }, (300 - w) / (winfo.real_w - w) * window_move_animate_time);
    }
    if (w >= 300 && winfo.real_w < 300) {
      setTimeout(function () {
        iframe.css('width', '100%');
      }, (w - 300) / (w - winfo.real_w) * window_move_animate_time);
    }
  };

  winfo.mask = function () {
    if (mask !== undefined) mask.css('pointer-events', 'auto');
  };

  winfo.unmask = function () {
    if (mask !== undefined) mask.css('pointer-events', 'none');
  };

  winfo.minimize = function () {
    winfo.minimized = true;
    winfo.setpos_animate(0, desktop_h, 0, 0, function () {
      if (winfo.minimized === true) window.hide();
    });
  };

  winfo.maximize = function () {
    winfo.setpos_animate(0, 0, desktop_w, desktop_h);
    winfo.maximized = true;
    maximizeButton.hide(); restoreButton.show();
  };

  winfo.restore = function () {
    winfo.setpos_animate(winfo.x, winfo.y, winfo.width, winfo.height);
    winfo.maximized = false;
    restoreButton.hide(); maximizeButton.show();
  };

  winfo.rename = function (title) {
    header.text(title);
    winfo.title = title;
    updateTaskbar();
  };
}

function createWindow(title, x, y, width, height, content, frames = true) {
  if ($('#screen-mask').is(':visible')) {
    $('#screen-mask').click();
  }

  var id = next_window_id++;
  var winfo = {
    "id": id,
    "title": title,
    "real_w": width,
    "real_h": height,
    "width": width,
    "height": height,
    "x": x,
    "y": y,
    "minimized": false,
    "maximized": false,
    "visible": true,
    "content": content,
    "always_on_top": false,
    "always_on_bottom": false,
    "frames": frames,
    "icon": null,
  };
  window_list[id] = winfo;

  if (frames === false) {
    var iframe = $('<iframe src="' + content + '" class="content-iframe"></iframe>');
    var windowElement = $('<div class="window"></div>').html(iframe);
    winfo.element = { "window": windowElement, "iframe": iframe };

    window_init(winfo);

    winfo.setpos(winfo.x, winfo.y, winfo.width, winfo.height);

    $('body').append(windowElement);

    return winfo;
  }

  var resizeElement = $('<div class="window-resize"></div>');
  var windowElement = $('<div class="window"></div>');
  var iconElement = $('<img>').hide();
  var headerElement = $('<div class="window-header"></div>').html($('<div>').append([iconElement, title]));
  var iframe = $('<iframe src="' + content + '" class="content-iframe"></iframe>');
  var mask = $('<div class="content-transparent-mask"></div>');
  var contentElement = $('<div class="content"></div>').html([iframe, mask]);
  var buttonsElement = $('<div class="window-buttons"></div>');

  var closeButton = $('<div class="window-button" title="关闭"><img src="icon/window-close-symbolic.svg"></div>').click(function () { winfo.close(); });
  var minimizeButton = $('<div class="window-button" title="最小化"><img src="icon/window-minimize-symbolic.svg"></div>').click(function () { winfo.minimize(); });
  var maximizeButton = $('<div class="window-button" title="最大化"><img src="icon/window-maximize-symbolic.svg"></div>').click(function () { winfo.maximize(); });
  var restoreButton = $('<div class="window-button" title="恢复"><img src="icon/window-restore-symbolic.svg"></div>').click(function () { winfo.restore(); }).hide();

  winfo.element = {
    "resize": resizeElement,
    "window": windowElement,
    "icon": iconElement,
    "header": headerElement,
    "content": contentElement,
    "buttons": buttonsElement,
    "iframe": iframe,
    "mask": mask,
    "minimize": minimizeButton,
    "maximize": maximizeButton,
    "restore": restoreButton,
    "close": closeButton,
  };

  new ResizeObserver(function () {
    if (winfo.maximized === false && winfo.minimized == false) {
      winfo.x = windowElement.offset().left;
      winfo.y = windowElement.offset().top;
      winfo.width = windowElement.width();
      winfo.height = windowElement.height();
    }
    winfo.real_w = windowElement.width();
    winfo.real_h = windowElement.height();
  }).observe(windowElement[0]);

  headerElement.append(buttonsElement.append([minimizeButton, restoreButton, maximizeButton, closeButton]));
  windowElement.append([headerElement, contentElement]);

  window_init(winfo);

  winfo.setpos(winfo.x, winfo.y, winfo.width, winfo.height);

  $('body').append([resizeElement, windowElement]);

  winfo.active();

  // 窗口拖动
  headerElement.mousedown(function (e) {
    e.preventDefault();

    var offsetX = e.clientX - winfo.x;
    var offsetY = e.clientY - winfo.y;
    if (winfo.maximized === true) {
      offsetX = e.clientX / document.documentElement.clientWidth * winfo.width;
      offsetY = e.clientY;
    }

    window_mask_all();

    $(document).mousemove(function (e) {
      if (e.clientY < 15) {
        offsetX = e.clientX / document.documentElement.clientWidth * winfo.width;
        offsetY = e.clientY;
      }

      // 计算窗口位置
      winfo.y = e.clientY - offsetY;
      winfo.y = winfo.y < 0 ? 0 : winfo.y;
      var taskbar_h = taskbarElement.height() + 2 * parseInt(taskbarElement.css('padding'), 10);
      var header_h = headerElement.height() + 2 * parseInt(headerElement.css('padding'), 10);
      var y_max = screen_h - taskbar_h - header_h;
      winfo.y = winfo.y > y_max ? y_max : winfo.y;
      winfo.x = e.clientX - offsetX;

      if (e.clientY < 15) {
        if (winfo.maximized === false) maximizeButton.click();
        return;
      }
      if (winfo.maximized === true) restoreButton.click();

      winfo.setpos(winfo.x, winfo.y, winfo.width, winfo.height);
    });

    $(document).mouseup(function () {
      window_unmask_all();
      $(document).off('mousemove');
      $(document).off('mouseup');
    });
  });

  // 大小调整
  resizeElement.mousemove(function (e) {
    e.preventDefault();

    const offsetX = e.clientX - resizeElement.position().left;
    const offsetY = e.clientY - resizeElement.position().top;
    const width = resizeElement.width()
    const height = resizeElement.height()
    const n = window_resize_area_width;

    // 根据鼠标位置判断应该显示什么光标
    if (offsetX < n && offsetY < n) { // 左上
      resizeElement.css('cursor', 'nw-resize');
    } else if (offsetX > width - n && offsetY < n) { // 右上
      resizeElement.css('cursor', 'ne-resize');
    } else if (offsetX < n && offsetY > height - n) { // 左下
      resizeElement.css('cursor', 'sw-resize');
    } else if (offsetX > width - n && offsetY > height - n) { // 右下
      resizeElement.css('cursor', 'se-resize');
    } else if (offsetX < n) { // 左
      resizeElement.css('cursor', 'w-resize');
    } else if (offsetX > width - n) { // 右
      resizeElement.css('cursor', 'e-resize');
    } else if (offsetY < n) { // 上
      resizeElement.css('cursor', 'n-resize');
    } else if (offsetY > height - n) { // 下
      resizeElement.css('cursor', 's-resize');
    } else {
      resizeElement.css('cursor', 'auto');
    }
  });

  // 大小调整
  resizeElement.mousedown(function (e) {
    e.preventDefault();
    if (winfo.maximized === true || winfo.minimized === true) return;

    var oldX = winfo.x, oldY = winfo.y;
    var oldW = winfo.width, oldH = winfo.height;

    var oldMX = e.clientX, oldMY = e.clientY;

    const cursor = resizeElement.css('cursor');

    window_mask_all();

    $(document).mousemove(function (e) {
      var dx = e.clientX - oldMX, dy = e.clientY - oldMY;
      if (cursor === 'nw-resize') { // 左上
        winfo.setpos(oldX + dx, oldY + dy, oldW - dx, oldH - dy);
      } else if (cursor === 'ne-resize') { // 右上
        winfo.setpos(oldX, oldY + dy, oldW + dx, oldH - dy);
      } else if (cursor === 'sw-resize') { // 左下
        winfo.setpos(oldX + dx, oldY, oldW - dx, oldH + dy);
      } else if (cursor === 'se-resize') { // 右下
        winfo.setpos(oldX, oldY, oldW + dx, oldH + dy);
      } else if (cursor === 'w-resize') { // 左
        winfo.setpos(oldX + dx, oldY, oldW - dx, oldH);
      } else if (cursor === 'e-resize') { // 右
        winfo.setpos(oldX, oldY, oldW + dx, oldH);
      } else if (cursor === 'n-resize') { // 上
        winfo.setpos(oldX, oldY + dy, oldW, oldH - dy);
      } else if (cursor === 's-resize') { // 下
        winfo.setpos(oldX, oldY, oldW, oldH + dy);
      }
    });

    $(document).mouseup(function () {
      window_unmask_all();
      $(document).off('mousemove');
      $(document).off('mouseup');
    });
  });

  windowElement.mousedown(function (e) {
    winfo.active();
  });

  iframe.on('load', function () {
    $(iframe[0].contentDocument).mousedown(function (e) {
      winfo.active();
    });
  });

  updateTaskbar();

  return winfo;
}
