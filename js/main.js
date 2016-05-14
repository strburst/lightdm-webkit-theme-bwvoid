(function() {
  /**
   * Format a date nicely.
   */
  function formatDate() {
    var toWeekday = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday',
      'Friday', 'Saturday'];
    var toMonth = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];

    var date = new Date();
    return toWeekday[date.getDay()] + ', ' + toMonth[date.getMonth()] + ' ' +
      date.getDate();
  }

  /**
   * Generic function to place text in the message area.
   */
  function showMessage(msg, clearBefore) {
    if (clearBefore) {
      $('#messages').children().remove();
    }
    $('#messages').prepend('<p>' + msg + '</p>');
  }

  $(document).ready(function() {
    $('#putDateHere').text(formatDate());
    $('#putHostnameHere').text(lightdm.hostname);

    $('#loginForm').find('input').keydown((function(event) {
      if (event.which === 13 && !lightdm.in_authentication) {
        // Enter; submit username/password
        showMessage('Attempting to authenticate ' + $('#username').val() +
            '...', true);

        // Disable input fields while authentication is occurring
        $('#username').prop('disabled', true);
        $('#password').prop('disabled', true);

        lightdm.authenticate($('#username').val());
      }
    }));

    $('#username').focus();
  });

  /**
   * Handler called when authentication is finished.
   */
  window.authentication_complete = function() {
    if (lightdm.is_authenticated) {
      showMessage('Authentication successful.');

      // Trigger fade out animation
      $('body').toggleClass('fadeOut');
      setTimeout(function() {
        lightdm.start_session_sync();
      }, 700);
    } else {
      showMessage('Authentication failed.');

      $('#username').prop('disabled', false);
      $('#password').prop('disabled', false);
    }
  };

  /**
   * Handler for lightdm messages (rarely called).
   */
  window.show_message = function(text, type) {
    showMessage('LightDM message (type "' + type + '"): ' + text);
  };

  /**
   * Handler for lightdm prompts (usually for the password).
   */
  window.show_prompt = function(text, type) {
    if (type === 'password') {
      lightdm.respond($('#password').val());
    } else {
      showMessage('Unknown LightDM prompt (type ' + type + '): ' + text);
    }
  };

  /**
   * Basic error handler to display the error that occured.
   */
  window.onerror = function(message, path, line) {
    var file = path.split('/').pop();
    showMessage(message + ' in ' + file + ':' + line + '.');
  };
})();
