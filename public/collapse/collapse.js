$(document).ready(() => {
  $('#togglebox1').click(() => {
    if ($('#subdiv1').css('display') != 'block') {
      $('#subdiv1').slideDown();
      $('#toggletext1').text('Hide');
      $('#togglebox1').css('cursor', 'zoom-in');
      $('html, body').animate({
        scrollTop: $('#togglebox1').offset().top,
      }, 500);
    } else {
      $('#subdiv1').slideUp();
      $('#toggletext1').text('Show');
      $('#togglebox1').css('cursor', 'zoom-out');
    }
  });

  $('#togglebox2').click(() => {
    if ($('#subdiv2').css('display') != 'block') {
      $('#subdiv2').slideDown();
      $('#toggletext2').text('Hide');
      $('#togglebox2').css('cursor', 'zoom-in');
      $('html, body').animate({
        scrollTop: $('#togglebox2').offset().top,
      }, 500);
    } else {
      $('#subdiv2').slideUp();
      $('#toggletext2').text('Show');
      $('#togglebox2').css('cursor', 'zoom-out');
    }
  });

  $('#togglebox3').click(() => {
    if ($('#subdiv3').css('display') != 'block') {
      $('#subdiv3').slideDown();
      $('#toggletext3').text('Hide');
      $('#togglebox3').css('cursor', 'zoom-in');
      $('html, body').animate({
        scrollTop: $('#togglebox3').offset().top,
      }, 500);
    } else {
      $('#subdiv3').slideUp();
      $('#toggletext3').text('Show');
      $('#togglebox3').css('cursor', 'zoom-out');
    }
  });
});
