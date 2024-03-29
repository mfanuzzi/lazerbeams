﻿$(function () {
    var hashed = false;

    // Expanding/closing descriptions
    $('.catalog-item .art img').click(function () {
    	if ($('.catalog-item.on .art img').is(this)) {
    		$(this).parent().parent().toggleClass('on');
    	} else {
	        $('.catalog-item.on').removeClass('on');
        	$(this).parent().parent().addClass('on');
        }

        //setTimeout(function() {
            if ($('.catalog-item.on').length > 0) {
                focusItem($('.catalog-item.on'));
            }
        //}, 1);
    });

    //Hoverstate/tap cover switching
    $('.info .imgswitch').on('mouseover touchstart', function (e) {
        var $cover = $(this).closest('.art').children('img');
        
        if (!$cover.data('srcset')) {
            $cover.data('srcset', $cover.attr('srcset'));
        }

        $cover.attr('src', $(this).data('url'));
        $cover.attr('srcset', '');

        if (e.type === 'touchstart') {
            e.stopPropagation();

            $('body').off('touchstart.is');
            $('body').one('touchstart.is', function (ee) {
                if (! $(ee.target).hasClass('imgswitch')) {
                    $cover.attr('srcset', $cover.data('srcset'));
                    $cover.attr('src', '');
                }
            });
        }
    });
    $('.info .imgswitch').on('mouseout', function () {
        let $cover = $(this).closest('.art').children('img');
        $cover.attr('srcset', $cover.data('srcset'));
        $cover.attr('src', '');
    });


    //Sorting and filtering
	var allMedia = $('.catalog-item').map(function(){ return $(this).attr('data-medium'); }).get();
	var allArtists = $('.catalog-item').map(function(){ return $(this).attr('data-artist'); }).get();

	//First, remove options that don't have any items assosciated w/them
	$('#sort-medium li').each(function(i) {
		if ($.inArray($(this).attr('data-medium'), allMedia) === -1) {
			$(this).addClass('inactive');
		}
	});
	$('#sort-artist li').each(function(i) {
		if ($.inArray($(this).attr('data-artist'), allArtists) === -1) {
			$(this).addClass('inactive');
		}
	});

	//Bindings
    $('#sort-medium li').click(function() {
    	if ($(this).hasClass('inactive'))
    		return;

		$(this).toggleClass('on');
		if ($('#sort-medium li.on').length === $('#sort-medium li').length)
			$('#sort-medium li.on').removeClass('on');
		UpdateSort();
    });

    $('#sort-artist li').click(function() {
    	if ($(this).hasClass('inactive'))
    		return;

		$(this).toggleClass('on');
		if ($('#sort-artist li.on').length === $('#sort-artist li').length)
			$('#sort-artist li.on').removeClass('on');
		UpdateSort();
    });

    function UpdateSort() {
    	var activeMedia = $('#sort-medium li.on').map(function(){ return $(this).attr('data-medium'); }).get();
    	var anyMedia = activeMedia.length === 0;

    	var activeArtists = $('#sort-artist li.on').map(function(){ return $(this).attr('data-artist'); }).get();
    	var anyArtist = activeArtists.length === 0;


    	$('.catalog-item').each(function(i) {
    		console.log($(this).attr('data-medium'));
    		console.log($.inArray($(this).attr('data-medium'), activeMedia));
    		console.log($(this).attr('data-artist'));
    		console.log($.inArray($(this).attr('data-artist'), activeArtists));

    		if ((anyMedia || $.inArray(
    				$(this).attr('data-medium'),
    				activeMedia) > -1) && 
    			(anyArtist || $.inArray(
	    			$(this).attr('data-artist'),
	    			activeArtists) > -1))
    			{
	    			$(this).removeClass('hide');
    			}
    			else
    				$(this).addClass('hide');
    		});
    	}

    // Handle the hashtag on load
    if (window.location.hash) {
        var hashStr = window.location.hash;
        if (hashStr == "#catalog") {
            hashStr = "#catalogue";
        }

        var requestedItem = $(hashStr);
        if (requestedItem.length > 0) {
            var catItem = requestedItem.find('.art img');
            if (catItem.length > 0) {
                catItem.click();
            }
            else {
                focusItem(requestedItem);
            }
            hashed = true;
        }
        window.location.hash = '';
    }

    function focusItem(catalogItem) {
        var vw = $(window).width()/100;
        var portrait = $(window).width() < $(window).height();
        var offset = catalogItem.offset();
        
        $('body, html').delay(10).animate({
          scrollTop: offset.top - ((portrait ? .5 : 9)*vw)
        }, (hashed?1000:300));

        hashed = false;
    }
});