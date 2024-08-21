
const menu_w = 500, menu_h = 600;

var desktop_menu;

function createMenu(content) {
  desktop_menu = createWindow('', 0, 0, menu_w, menu_h, content, false);
  desktop_menu.element.window.css('z-index', 2147483647);
  desktop_menu.element.window.hide();
}

$('#screen-mask').on('click', function () {
  var taskbar_h = taskbarElement.height() + 2 * parseInt(taskbarElement.css('padding'), 10);
  desktop_menu.setpos_animate(0, screen_h - taskbar_h, menu_w, 0, function () {
    desktop_menu.element.window.hide();
  });
  $('#screen-mask').hide();
});

$('#menu-button').on('click', function () {
  var taskbar_h = taskbarElement.height() + 2 * parseInt(taskbarElement.css('padding'), 10);
  $('#screen-mask').show();
  desktop_menu.element.window.show();
  desktop_menu.setpos(0, screen_h - taskbar_h, menu_w, 0, false);
  desktop_menu.setpos_animate(0, screen_h - taskbar_h - menu_h, menu_w, menu_h);
});
