$(function () {
    $('#catalog-items > div .art img').click(function () {
    	if ($('#catalog-items > div.on .art img').is(this)) {
    		$(this).parent().parent().toggleClass('on');
    	} else {
	        $('#catalog-items > div.on').removeClass('on');
        	$(this).parent().parent().addClass('on');
        }
    });
});