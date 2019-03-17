/* eslint-disable */

function checkPasswordMatch() {
    var password = $("#newPassword").val();
    var confirmPassword = $("#confirmPassword").val();

    if (password != confirmPassword)
        $("#confirmPassword").get(0).setCustomValidity('Passwords do not match.');
    else
        $("#confirmPassword").get(0).setCustomValidity('');
}

$(document).ready(function () {
   $("#newPassword, #confirmPassword").keyup(checkPasswordMatch);
});

