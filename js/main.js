(function() {
  function formatDate() {
    // Format a date nicely
    var toWeekday = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday',
      'Friday', 'Saturday'];
    var toMonth = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];

    var date = new Date();
    return toWeekday[date.getDay()] + ', ' + toMonth[date.getMonth()] + ' ' +
      date.getDate();
  }

  function showMessage(msg) {
    $('#output').prepend('<p>' + msg + '</p>');
  }

  $(document).ready(function() {
    $('#putDateHere').text(formatDate());
    $('#putHostnameHere').text(lightdm.hostname);

    $('#loginForm').find('input').keydown((function(event) {
      if (event.which === 13) {  // Enter
        showMessage('Attempting to authenticate ' + $('#username').val() +
            '...');

        lightdm.start_authentication($('#username').val());
      }
    }));

    $('#username').focus();
  });

  window.authentication_complete = function() {
    if (lightdm.is_authenticated) {
      showMessage('Authentication successful.');
      lightdm.login(lightdm.authentication_user, 'bspwm');
    } else {
      showMessage('Authentication failed.');
    }
  };

  window.show_prompt = function(text, type) {
    lightdm.respond($('#password').val());
  };

  window.onerror = function(message, path, line) {
    var file = path.split('/').pop();
    showMessage(message + ' in ' + file + ':' + line + '.');
  };
})();
