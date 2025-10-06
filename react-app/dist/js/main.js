(function ($) {
    "use strict";

    function initDropdownHover() {
        function toggleNavbarMethod() {
            if ($(window).width() > 768) {
                $('.navbar .dropdown').on('mouseover', function () {
                    $('.dropdown-toggle', this).trigger('click');
                }).on('mouseout', function () {
                    $('.dropdown-toggle', this).trigger('click').blur();
                });
            } else {
                $('.navbar .dropdown').off('mouseover').off('mouseout');
            }
        }
        toggleNavbarMethod();
        $(window).off('resize.__dropdown').on('resize.__dropdown', toggleNavbarMethod);
    }

    function initBackToTop() {
        $(window).off('scroll.__btt').on('scroll.__btt', function () {
            if ($(this).scrollTop() > 100) {
                $('.back-to-top').fadeIn('slow');
            } else {
                $('.back-to-top').fadeOut('slow');
            }
        });
        $('.back-to-top').off('click.__btt').on('click.__btt', function () {
            $('html, body').animate({scrollTop: 0}, 1500, 'easeInOutExpo');
            return false;
        });
    }

    function initSlickSliders() {
        if ($('.header-slider').length && !$('.header-slider').hasClass('slick-initialized')) {
            $('.header-slider').slick({
                autoplay: true,
                dots: true,
                infinite: true,
                slidesToShow: 1,
                slidesToScroll: 1
            });
        }

        if ($('.product-slider-4').length) {
            $('.product-slider-4').each(function(){
                var $el = $(this);
                if (!$el.hasClass('slick-initialized')) {
                    $el.slick({
                        autoplay: true,
                        infinite: true,
                        dots: false,
                        slidesToShow: 4,
                        slidesToScroll: 1,
                        responsive: [
                            { breakpoint: 1200, settings: { slidesToShow: 4 } },
                            { breakpoint: 992, settings: { slidesToShow: 3 } },
                            { breakpoint: 768, settings: { slidesToShow: 2 } },
                            { breakpoint: 576, settings: { slidesToShow: 1 } },
                        ]
                    });
                }
            });
        }

        if ($('.product-slider-3').length) {
            $('.product-slider-3').each(function(){
                var $el = $(this);
                if (!$el.hasClass('slick-initialized')) {
                    $el.slick({
                        autoplay: true,
                        infinite: true,
                        dots: false,
                        slidesToShow: 3,
                        slidesToScroll: 1,
                        responsive: [
                            { breakpoint: 992, settings: { slidesToShow: 3 } },
                            { breakpoint: 768, settings: { slidesToShow: 2 } },
                            { breakpoint: 576, settings: { slidesToShow: 1 } },
                        ]
                    });
                }
            });
        }

        if ($('.product-slider-single').length) {
            if (!$('.product-slider-single').hasClass('slick-initialized')) {
                $('.product-slider-single').slick({
                    infinite: true,
                    autoplay: true,
                    dots: false,
                    fade: true,
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    asNavFor: '.product-slider-single-nav'
                });
            }
            if ($('.product-slider-single-nav').length && !$('.product-slider-single-nav').hasClass('slick-initialized')) {
                $('.product-slider-single-nav').slick({
                    slidesToShow: 3,
                    slidesToScroll: 1,
                    dots: false,
                    centerMode: true,
                    focusOnSelect: true,
                    asNavFor: '.product-slider-single'
                });
            }
        }

        if ($('.brand-slider').length && !$('.brand-slider').hasClass('slick-initialized')) {
            $('.brand-slider').slick({
                speed: 5000,
                autoplay: true,
                autoplaySpeed: 0,
                cssEase: 'linear',
                slidesToShow: 5,
                slidesToScroll: 1,
                infinite: true,
                swipeToSlide: true,
                centerMode: true,
                focusOnSelect: false,
                arrows: false,
                dots: false,
                responsive: [
                    { breakpoint: 992, settings: { slidesToShow: 4 } },
                    { breakpoint: 768, settings: { slidesToShow: 3 } },
                    { breakpoint: 576, settings: { slidesToShow: 2 } },
                    { breakpoint: 300, settings: { slidesToShow: 1 } },
                ]
            });
        }

        if ($('.review-slider').length && !$('.review-slider').hasClass('slick-initialized')) {
            $('.review-slider').slick({
                autoplay: true,
                dots: false,
                infinite: true,
                slidesToShow: 2,
                slidesToScroll: 1,
                responsive: [
                    { breakpoint: 768, settings: { slidesToShow: 1 } },
                ]
            });
        }

        if ($('.sidebar-slider').length && !$('.sidebar-slider').hasClass('slick-initialized')) {
            $('.sidebar-slider').slick({
                autoplay: true,
                dots: false,
                infinite: true,
                slidesToShow: 1,
                slidesToScroll: 1
            });
        }
    }

    function initQuantity() {
        $('.qty button').off('click.__qty').on('click.__qty', function () {
            var $button = $(this);
            var oldValue = $button.parent().find('input').val();
            var newVal;
            if ($button.hasClass('btn-plus')) {
                newVal = parseFloat(oldValue) + 1;
            } else {
                if (oldValue > 0) {
                    newVal = parseFloat(oldValue) - 1;
                } else {
                    newVal = 0;
                }
            }
            $button.parent().find('input').val(newVal);
        });
    }

    function initCheckout() {
        $('.checkout #shipto').off('change.__ship').on('change.__ship', function () {
            if($(this).is(':checked')) {
                $('.checkout .shipping-address').slideDown();
            } else {
                $('.checkout .shipping-address').slideUp();
            }
        });

        $('.checkout .payment-method .custom-control-input').off('change.__pay').on('change.__pay', function () {
            if ($(this).prop('checked')) {
                var checkbox_id = $(this).attr('id');
                $('.checkout .payment-method .payment-content').slideUp();
                $('#' + checkbox_id + '-show').slideDown();
            }
        });
    }

    function tribalInit() {
        initDropdownHover();
        initBackToTop();
        initSlickSliders();
        initQuantity();
        initCheckout();
    }

    // Expose global init for React re-mounts
    window.__tribalInit = tribalInit;

    // Initial run when DOM is ready
    $(document).ready(function(){
        tribalInit();
    });
})(jQuery);

