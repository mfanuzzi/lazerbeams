$(function () {
    $('.catalog-item .art img').click(function () {
    	if ($('.catalog-item.on .art img').is(this)) {
    		$(this).parent().parent().toggleClass('on');
    	} else {
	        $('.catalog-item.on').removeClass('on');
        	$(this).parent().parent().addClass('on');
        }
    });

    $('#sort-medium li').click(function() {
		$(this).toggleClass('on');
		if ($('#sort-medium li.on').length === $('#sort-medium li').length)
			$('#sort-medium li.on').removeClass('on');
		UpdateSort();
    });

    $('#sort-artist li').click(function() {
		$(this).toggleClass('on');
		if ($('#sort-artist li.on').length === $('#sort-artist li').length)
			$('#sort-artist li.on').removeClass('on');
		UpdateSort();
    });

    function UpdateSort() {
    	var activeMedia = $('#sort-medium li.on').map(function(){ return $(this).attr('data-medium'); }).get();
    	if (activeMedia.length == 0)
    		activeMedia = $('#sort-medium li').map(function(){ return $(this).attr('data-medium'); }).get();

    	var activeArtists = $('#sort-artist li.on').map(function(){ return $(this).attr('data-artist'); }).get();
    	if (activeArtists.length == 0)
    		activeArtists = $('#sort-artist li').map(function(){ return $(this).attr('data-artist'); }).get();

    	console.log(activeArtists);
    	console.log(activeMedia);

    	$('.catalog-item').each(function(i) {
    		console.log($(this).attr('data-medium'));
    		console.log($.inArray($(this).attr('data-medium'), activeMedia));
    		console.log($(this).attr('data-artist'));
    		console.log($.inArray($(this).attr('data-artist'), activeArtists));

    		if (($.inArray(
    				$(this).attr('data-medium'),
    				activeMedia) > -1) && 
    			($.inArray(
	    			$(this).attr('data-artist'),
	    			activeArtists) > -1))
    			{
	    			$(this).removeClass('hide');
    			}
    			else
    				$(this).addClass('hide');
    		});
    	}
});