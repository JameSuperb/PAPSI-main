/**
 * WEBSITE: https://themefisher.com
 * TWITTER: https://twitter.com/themefisher
 * FACEBOOK: https://www.facebook.com/themefisher
 * GITHUB: https://github.com/themefisher/
 */

(function ($) {
	'use strict';

	// Preloader js    
	$(window).on('load', function () {
		$('.preloader').fadeOut(700);
	});

	// Sticky Menu
	$(window).scroll(function () {
		var height = $('.top-header').innerHeight();
		if ($('header').offset().top > 10) {
			$('.top-header').addClass('hide');
			$('.navigation').addClass('nav-bg');
			$('.navigation').css('margin-top', '-' + height + 'px');
		} else {
			$('.top-header').removeClass('hide');
			$('.navigation').removeClass('nav-bg');
			$('.navigation').css('margin-top', '-' + 0 + 'px');
		}
	});
	// navbarDropdown
	if ($(window).width() < 992) {
		$('.navigation .dropdown-toggle').on('click', function () {
			$(this).siblings('.dropdown-menu').animate({
				height: 'toggle'
			}, 300);
		});
	}

	// Background-images
	$('[data-background]').each(function () {
		$(this).css({
			'background-image': 'url(' + $(this).data('background') + ')'
		});
	});

	//Hero Slider
	$('.hero-slider').slick({
		autoplay: true,
		autoplaySpeed: 7500,
		pauseOnFocus: false,
		pauseOnHover: false,
		infinite: true,
		arrows: true,
		fade: true,
		prevArrow: '<button type=\'button\' class=\'prevArrow\'><i class=\'ti-angle-left\'></i></button>',
		nextArrow: '<button type=\'button\' class=\'nextArrow\'><i class=\'ti-angle-right\'></i></button>',
		dots: true
	});
	$('.hero-slider').slickAnimation();

	// venobox popup
	$(document).ready(function () {
		$('.venobox').venobox();
	});
	
	// Initialize Venobox for promo bundles images
	$(function () {
		if (typeof $.fn.venobox === 'function') {
			$('.vbox').venobox({
				numeratio: true,
				infinigall: true
			});
		}
	});

	// Promo Registration Form: validation and submission
	$(function () {
		var form = $("section[aria-labelledby='promo-registration'] form");
		if (!form.length) return;

		var emailInput = form.find('#regEmail');
		var firstNameInput = form.find('#regFirstName');
		var miInput = form.find('#regMI');
		var lastNameInput = form.find('#regLastName');
		var suffixInput = form.find('#regSuffix');
		var submitBtn = form.find('button.btn');

		function showInlineError(input, message) {
			var help = $('<small class="form-text text-danger"></small>').text(message);
			// remove existing error siblings
			input.siblings('.form-text.text-danger').remove();
			input.after(help);
		}

		function clearInlineError(input) {
			input.siblings('.form-text.text-danger').remove();
		}

		function isValidEmail(email) {
			// Basic email pattern
			var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			return re.test(String(email).toLowerCase());
		}

		function containsDisallowedSuffix(text) {
			if (!text) return false;
			var t = text.toUpperCase();
			// Disallowed tokens (with and without punctuation)
			var blocked = [
				'LPT', 'PH.D', 'PHD', 'ED.D', 'EDD', 'MD', 'DR', 'D.R'
			];
			// Normalize dots for comparison
			var norm = t.replace(/\./g, '');
			return blocked.includes(norm) || blocked.includes(t);
		}

		function buildNameText(fn, mi, ln, sx) {
			// Concatenate without spaces, remove '.' and ',', keep '-' and 'Ñ'
			var parts = [fn || '', mi || '', ln || '', sx || ''];
			var raw = parts.join('');
			// Trim spaces around and inside? Spec implies concatenation, so remove spaces.
			raw = raw.replace(/\s+/g, '');
			// Remove dot and comma only
			raw = raw.replace(/[\.,]/g, '');
			// Uppercase preserving special characters like Ñ
			var upper = raw.toLocaleUpperCase('en-PH');
			return upper.trim();
		}

		submitBtn.on('click', function () {
			// Clear prior errors
			[emailInput, firstNameInput, miInput, lastNameInput, suffixInput].forEach(function (el) { clearInlineError(el); });

			// Honeypot check
			var hp = form.find('input[name="hp"]').val();
			if (hp) { return; }

			var email = emailInput.val().trim();
			var firstName = firstNameInput.val().trim();
			var middleInitial = miInput.val().trim();
			var lastName = lastNameInput.val().trim();
			var suffix = suffixInput.val().trim();

			// Validate email
			if (!email) {
				showInlineError(emailInput, 'Please enter your email address.');
				emailInput.focus();
				return;
			}
			if (!isValidEmail(email)) {
				showInlineError(emailInput, 'Email address looks incorrect.');
				emailInput.focus();
				return;
			}

			// Validate names
			if (!firstName) {
				showInlineError(firstNameInput, 'Please enter your first name.');
				firstNameInput.focus();
				return;
			}
			if (!lastName) {
				showInlineError(lastNameInput, 'Please enter your last name.');
				lastNameInput.focus();
				return;
			}

			// Validate suffix: clear on disallowed titles
			if (containsDisallowedSuffix(suffix)) {
				suffixInput.val('');
				showInlineError(suffixInput, 'Suffix should not include titles like LPT, PhD, EdD, MD.');
				suffixInput.focus();
				return;
			}

			// Build nametext
			var nametext = buildNameText(firstName, middleInitial, lastName, suffix);

			// Submit to Apps Script endpoint
			var baseUrl = 'https://script.google.com/macros/s/AKfycbys_Em108LXKUoiQ6VbmECERa32-n5-txdMdmAykllxDuOkMNHdOrmBzqaZs-x4RYkpLA/exec';
			var url = baseUrl + '?func=nametext&nametext=' + encodeURIComponent(nametext);

			// Disable button while processing
			submitBtn.prop('disabled', true).text('Processing...');

			fetch(url, { method: 'GET' })
				.then(function (resp) { return resp.text(); })
				.then(function (text) {
					var trimmed = text.trim();
					var message;
					try {
						var json = JSON.parse(trimmed);
						if (json && json.message && /PAPSI Member/i.test(json.message)) {
							message = 'PAPSI Member found. Proceeding to next step.';
						}
					} catch (e) {
						// Not JSON, handle as plain text
					}
					if (!message) {
						if (/New Member/i.test(trimmed)) {
							message = 'Welcome! You are a new member.';
						} else if (/Error: Contact admin support/i.test(trimmed)) {
							message = 'There was an error. Please contact admin support.';
						} else {
							message = 'Received response: ' + trimmed;
						}
					}
					// Show feedback below button
					var feedback = form.find('.submission-feedback');
					if (!feedback.length) {
						feedback = $('<div class="submission-feedback mt-2"></div>');
						submitBtn.after(feedback);
					}
					feedback.text(message).removeClass('text-danger').addClass('text-success');
				})
				.catch(function () {
					var feedback = form.find('.submission-feedback');
					if (!feedback.length) {
						feedback = $('<div class="submission-feedback mt-2"></div>');
						submitBtn.after(feedback);
					}
					feedback.text('Network error. Please try again.').removeClass('text-success').addClass('text-danger');
				})
				.finally(function () {
					submitBtn.prop('disabled', false).text('Enter');
				});
		});
	});


	// filter
	$(document).ready(function () {
		var containerEl = document.querySelector('.filtr-container');
		var filterizd;
		if (containerEl) {
			filterizd = $('.filtr-container').filterizr({});
		}
		//Active changer
		$('.filter-controls li').on('click', function () {
			$('.filter-controls li').removeClass('active');
			$(this).addClass('active');
		});
	});

	//  Count Up
	function counter() {
		var oTop;
		if ($('.count').length !== 0) {
			oTop = $('.count').offset().top - window.innerHeight;
		}
		if ($(window).scrollTop() > oTop) {
			$('.count').each(function () {
				var $this = $(this),
					countTo = $this.attr('data-count');
				$({
					countNum: $this.text()
				}).animate({
					countNum: countTo
				}, {
					duration: 1000,
					easing: 'swing',
					step: function () {
						$this.text(Math.floor(this.countNum));
					},
					complete: function () {
						$this.text(this.countNum);
					}
				});
			});
		}
	}
	$(window).on('scroll', function () {
		counter();
	});

	/** gallery */
	

	



})(jQuery);