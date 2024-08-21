
var auto_login = localStorage.getItem('autologin');
var token = localStorage.getItem('token');

window.onload = function () {
  if (auto_login === 'true') {
    init(true);
  }
};

$('#register-button').on('click', function () {
  var username = $('#username').val();
  var password = $('#password').val();
  $.get('/api/gensalt', function (data) {
    password = username + '$' + password + '$' + data.salt
    password = CryptoJS.MD5(password).toString(CryptoJS.enc.Hex);
    $.get('/api/register?user=' + username + '&password=' + password + '&salt=' + data.salt, function (data) {
      if (data.ret === 200) {
        init();
      } else if (data.ret === 400) {
        alert(data.msg);
      }
    });
  });
  $('#username').val('');
  $('#password').val('');
});
$('#login-button').on('click', function () {
  var username = $('#username').val();
  var password = $('#password').val();
  $.get('/api/getsalt?user=' + username, function (data) {
    password = username + '$' + password + '$' + data.salt
    password = CryptoJS.MD5(password).toString(CryptoJS.enc.Hex);
    $.get('/api/login?user=' + username + '&password=' + password, function (data) {
      if (data.ret === 200) {
        init();
      } else if (data.ret === 400) {
        alert(data.msg);
      }
    });
  });
  $('#username').val('');
  $('#password').val('');
});
$('#nologin-button').on('click', function () {
  init();
});
