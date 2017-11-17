$(function () {
    $('#catalog-items > div').click(function () {
        $('#catalog-items > div.on').removeClass('on');

        $(this).addClass('on');
    });
});