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

  /**
   * Toggle or set whether username/password fields are enabled.
   *
   * @state if true, enable; if false, disable; if undefined, toggle
   */
  function setInputActive(state) {
    state = typeof state === 'undefined'
      ?  $('#username').prop('disabled')
      : state;

    // Set appropriate fields to enabled/disabled
    $('#username').prop('disabled', !state);
    $('#password').prop('disabled', !state);
  }

  $(document).ready(function() {
    $('#putDateHere').text(formatDate());
    $('#putHostnameHere').text(lightdm.hostname);

    $('#loginForm').find('input').keydown((function(event) {
      if (event.which === 13) {
        // Enter; submit username/password
        showMessage('Attempting to authenticate ' + ($('#username').val() ||
          'blank') + '...', true);

        // Disable input fields while authentication is occurring
        setInputActive(false);

        lightdm.authenticate();
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

      setInputActive(true);

      $('#password').val('');
    }
  };

  /**
   * Handler for generic lightdm messages (rarely called).
   */
  window.show_message = function(text, type) {
    showMessage('LightDM message (type "' + type + '"): ' + text);
  };

  /**
   * Handler for lightdm prompts (e.g. username or password).
   */
  window.show_prompt = function(text, type) {
    function respondWithField(selector, errorMsg) {
      var response = $(selector).val();
      if (response) {
        lightdm.respond(response);
      } else {
        // Nothing in the appropriate field
        // Cancel authentication and reactivate inputs
        lightdm.cancel_authentication();

        showMessage(errorMsg);

        setInputActive(true);
        $(selector).focus();
      }
    }

    if (type === 'password') {
      respondWithField('#password', 'Enter your password.');
    } else if (type === 'text') {
      respondWithField('#username', 'Enter your username.');
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
