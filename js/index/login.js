
var auto_login = localStorage.getItem('autologin');
var token = localStorage.getItem('token');

window.onload = function () {
  if (auto_login === 'true') {
    init(true);
  }
};

$('#register-button').on('click', async function () {
  try {
    const username = $('#username').val();
    const password = $('#password').val();

    const salt = await $.get('/api/gensalt').salt;
    const md5 = CryptoJS.MD5(`${username}\$${password}\$${salt}`).toString(CryptoJS.enc.Hex);

    const { ret, msg } = await $.get(`/api/register?user=${username}&password=${md5}&salt=${salt}`);

    if (ret === 200) {
      init();
    } else if (ret === 400) {
      alert(msg);
    }
  } catch (error) {
    console.error('注册出错:', error);
    alert('注册过程中出现错误');
  } finally {
    $('#username').val('');
    $('#password').val('');
  }
});

$('#login-button').on('click', async function () {
  try {
    const username = $('#username').val();
    const password = $('#password').val();

    const salt = (await $.get('/api/getsalt?user=' + username)).salt;
    const md5 = CryptoJS.MD5(`${username}\$${password}\$${salt}`).toString(CryptoJS.enc.Hex);

    const { ret, msg } = (await $.get(`/ api / login ? user = ${username} & password=${md5}`)).ret;

    if (ret === 200) {
      init();
    } else if (ret === 400) {
      alert(msg);
    }
  } catch (error) {
    console.error('登录出错:', error);
    alert('登录过程中出现错误');
  } finally {
    $('#username').val('');
    $('#password').val('');
  }
});

// $('#register-button').on('click', function () {
//   const username = $('#username').val();
//   const password = $('#password').val();
//   $.get('/api/gensalt', data => {
//     const md5 = CryptoJS.MD5(`${ username }\$${ password }\$${ data.salt }`).toString(CryptoJS.enc.Hex);
//     $.get(`/ api / register ? user = ${ username } & password=${ md5 } & salt=${ data.salt }`, data => {
//       if (data.ret === 200) {
//         init();
//       } else if (data.ret === 400) {
//         alert(data.msg);
//       }
//     });
//   });
//   $('#username').val('');
//   $('#password').val('');
// });
// $('#login-button').on('click', function () {
//   const username = $('#username').val();
//   const password = $('#password').val();
//   $.get('/api/getsalt?user=' + username, data => {
//     const md5 = CryptoJS.MD5(`${ username }\$${ password }\$${ data.salt }`).toString(CryptoJS.enc.Hex);
//     $.get(`/ api / login ? user = ${ username } & password=${ md5 }`, data => {
//       if (data.ret === 200) {
//         init();
//       } else if (data.ret === 400) {
//         alert(data.msg);
//       }
//     });
//   });
//   $('#username').val('');
//   $('#password').val('');
// });
$('#nologin-button').on('click', function () {
  init();
});
