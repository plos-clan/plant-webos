
const menu_default_w = 500, menu_default_h = 600;

var desktop_menu;

function createMenu(content) {
  const taskbar_h = taskbarElement.height() + 2 * parseInt(taskbarElement.css('padding'), 10);
  const menu_w = Math.min(menu_default_w, screen_w);
  const menu_h = Math.min(menu_default_h, screen_h - taskbar_h);
  desktop_menu = createWindow('', 0, 0, menu_w, menu_h, content, false);
  desktop_menu.setpos(0, screen_h - taskbar_h, menu_w, 0, false);
  desktop_menu.element.main.css('z-index', 2147483647);
  desktop_menu.element.main.hide();
}

$('#screen-mask').on('click', function () {
  const taskbar_h = taskbarElement.height() + 2 * parseInt(taskbarElement.css('padding'), 10);
  const menu_w = Math.min(menu_default_w, screen_w);
  const menu_h = Math.min(menu_default_h, screen_h - taskbar_h);
  desktop_menu.setpos_animate(0, screen_h - taskbar_h, menu_w, 0, function () {
    desktop_menu.element.main.hide();
  });
  $('#screen-mask').hide();
});

$('#menu-button').on('click', function () {
  const taskbar_h = taskbarElement.height() + 2 * parseInt(taskbarElement.css('padding'), 10);
  const menu_w = Math.min(menu_default_w, screen_w);
  const menu_h = Math.min(menu_default_h, screen_h - taskbar_h);
  $('#screen-mask').show();
  desktop_menu.element.main.show();
  desktop_menu.setpos_animate(0, screen_h - taskbar_h - menu_h, menu_w, menu_h);
});
