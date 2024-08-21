
var taskbarElement = $('#taskbar');

function updateTaskbar() {
  var tasks = $('#taskbar-tasks');
  tasks.empty();

  var titles = {};

  for (let winfo of Object.values(window_list)) {
    if (winfo.frames === false) continue;

    var title = winfo.title;

    if (titles[title] !== undefined) {
      titles[title]++;
      title += ' ' + titles[title];
    } else {
      titles[title] = 1;
    }

    winfo.element.icon.show();

    var taskbarButton = $('<button class="taskbar-button"></button>');
    if (winfo.icon !== undefined) taskbarButton.html($('<img>').attr('src', winfo.icon));
    taskbarButton.append($('<div>').text(title));

    taskbarButton.click(function () {
      winfo.active();
    });

    tasks.append(taskbarButton);
  }
}
