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
		var titleInput = form.find('#regTitle');
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
			[emailInput, titleInput, firstNameInput, miInput, lastNameInput, suffixInput].forEach(function (el) { clearInlineError(el); });

			// Honeypot check
			var hp = form.find('input[name="hp"]').val();
			if (hp) { return; }

			var email = emailInput.val().trim();
			var title = titleInput.val().trim();
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

			// Validate title (required after email)
			if (!title) {
				showInlineError(titleInput, 'Please select or enter your title.');
				titleInput.focus();
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
					var message = '';
					var caseType = 'OTHER_TEXT';
					var jsonData = null;

					try {
						var json = JSON.parse(trimmed);
						if (json && json.message && /PAPSI Member/i.test(json.message)) {
							message = 'PAPSI Member found. Proceeding to next step.';
							caseType = 'PAPSI_MEMBER_JSON';
							jsonData = json;
						}
					} catch (e) {}

					if (!message) {
						if (/New Member/i.test(trimmed)) {
							message = 'Welcome! You are a new member.';
							caseType = 'NEW_MEMBER_TEXT';
						} else if (/Error: Contact admin support/i.test(trimmed)) {
							message = 'There was an error. Please contact admin support.';
							caseType = 'ERROR_TEXT';
						} else {
							message = 'Received response: ' + trimmed;
							caseType = 'OTHER_TEXT';
						}
					}

					var feedback = form.find('.submission-feedback');
					if (!feedback.length) {
						feedback = $('<div class="submission-feedback mt-2"></div>');
						submitBtn.after(feedback);
					}
					feedback.text(message).removeClass('text-danger').addClass('text-success');

					// Always proceed to expanded details regardless of case
					submitBtn.addClass('d-none');
					var expanded = form.find('#promoExpanded');
					if (expanded.length) {
						expanded.removeClass('hidden');
						initializeBundleRendering(form);
						initializeSpecializationOther(form);
						// Initialize fees with membership status and zero training prior to selection
						initializeAutoFees(form, caseType);
						if (caseType === 'PAPSI_MEMBER_JSON' && jsonData) {
							// Fill expanded form fields from JSON
							var spec = (jsonData.specialization || '').trim();
							var school = (jsonData.school || '').trim();
							var type = (jsonData.type || '').trim();
							var address = (jsonData.address || '').trim();

							var specSel = form.find('#regSpecialization');
							var specOther = form.find('#regSpecializationOther');
							if (specSel.length) {
								var hasExact = !!specSel.find('option').filter(function(){ return $(this).val() === spec; }).length;
								if (spec && hasExact) {
									specSel.val(spec);
									if (specOther.length) { specOther.addClass('d-none').removeAttr('required').val(''); }
								} else if (spec) {
									specSel.val('Other');
									initializeSpecializationOther(form);
									specOther = form.find('#regSpecializationOther');
									if (!specOther.length) {
										specOther = $('<input type="text" class="form-control mt-2" id="regSpecializationOther" name="specializationOther" placeholder="Please specify your specialization">');
										specSel.after(specOther);
									}
									specOther.removeClass('d-none').attr('required','required').val(spec);
								} else {
									specSel.val('');
									if (specOther.length) { specOther.addClass('d-none').removeAttr('required').val(''); }
								}
							}

							var schoolInput = form.find('#regSchoolName');
							if (schoolInput.length) schoolInput.val(school);

							var typeSel = form.find('#regSchoolType');
							if (typeSel.length) {
								var normalized = type ? (type.charAt(0).toUpperCase() + type.slice(1).toLowerCase()) : '';
								typeSel.val(normalized);
							}

							var addrInput = form.find('#regSchoolAddress');
							if (addrInput.length) addrInput.val(address);
						} else {
							// Clear fields for New Member, Error, or other text
							form.find('#regSpecialization').val('');
							form.find('#regSchoolName').val('');
							form.find('#regSchoolType').val('');
							form.find('#regSchoolAddress').val('');
							// Uncheck bundles and clear webinars
							form.find('#bundleGroup input[type="checkbox"]').prop('checked', false);
							form.find('#webinarItems').empty();
							initializeAutoFees(form, caseType);
						}
					}
				})
				.catch(function () {
					var feedback = form.find('.submission-feedback');
					if (!feedback.length) {
						feedback = $('<div class="submission-feedback mt-2"></div>');
						submitBtn.after(feedback);
					}
					feedback.text('Network error. Please try again.').removeClass('text-success').addClass('text-danger');
					// Proceed to expanded details with blank form on network error
					submitBtn.addClass('d-none');
					var expanded = form.find('#promoExpanded');
					if (expanded.length) {
						expanded.removeClass('hidden');
						initializeBundleRendering(form);
						initializeSpecializationOther(form);
						initializeAutoFees(form, 'OTHER_TEXT');
						form.find('#regSpecialization').val('');
						form.find('#regSchoolName').val('');
						form.find('#regSchoolType').val('');
						form.find('#regSchoolAddress').val('');
						form.find('#bundleGroup input[type="checkbox"]').prop('checked', false);
						form.find('#webinarItems').empty();
					}
				})
				.finally(function () {
					submitBtn.prop('disabled', false).text('Enter');
				});
		});

		// Initialize bundle change handling and webinar rendering
		function initializeBundleRendering(form) {
			var bundleMap = {
				physics: [
					'Impact in Motion: Understanding Momentum and Collisions through Real-World Examples',
					'Gamified Motion: Graphical and Computational Analysis of Kinematics & Projectile',
					'Twist and Turn: Exploring the Laws Behind Rotational Systems',
					'Vector Essentials: Building a Strong Foundation in Physics'
				],
				biology: [
					'Metabolic Mystery: Teaching Cell Metabolism with Clarity and Context',
					'Molecules of Life: Mastering Carbs, Proteins, Lipids, Nucleic Acids, and Enzymes',
					'Mendelian and Non-Mendelian Genetics and Inheritance',
					'Cell Essentials: Theory, Structure, and Function'
				],
				chemistry: [
					'React Right: Understanding and Classifying Chemical Reactions with Confidence',
					'Quantum Clarity: Mastering Orbital Diagrams and the Rules that Govern Them',
					'Molecular Geometry: Predicting the 3D Shapes of Molecules',
					'Stoichiometry Essentials: From Moles to Chemical Equations'
				],
				experiment: [
					'Science Experiment: Understanding Types, Variables, and Methodology',
					'Making Data Meaningful: Using the Right Statistical Tools',
					'Polishing and Publishing: Formatting, Style, & References using Microsoft Word and Mendeley'
				],
				research: [
					'The Research Writer’s Workshop: Manuscript Essentials for Success',
					'The Research Presenter’s Workshop: A Guide to Oral Presentations',
					'Practical Strategies & Tools for Effective Thesis Writing'
				],
				systematic: [
					'Building One’s Knowledge Base Through Systematic Review',
					'Systematic Review Writeshop: Focus on Developing the SR Protocol',
					'Presentation and Critiquing of Systematic Review Proposal'
				]
			};

			var bundleGroup = form.find('#bundleGroup');
			var webinarItems = form.find('#webinarItems');

			function render() {
				webinarItems.empty();
				var selected = [];
				bundleGroup.find('input[type="checkbox"]:checked').each(function () {
					selected.push($(this).val());
					var label = $(this).closest('.bundle-item');
					if (label.length) label.addClass('active');
				});
				// Sort selected bundles by fixed order, regardless of click order
				var fixedOrder = ['physics','biology','chemistry','experiment','research','systematic'];
				selected.sort(function(a, b){
					return fixedOrder.indexOf(a) - fixedOrder.indexOf(b);
				});

				// Helper: date utilities
				function startOfToday(){
					var d = new Date();
					d.setHours(0,0,0,0);
					return d;
				}
				function addDays(date, days){
					var d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
					d.setDate(d.getDate() + days);
					return d;
				}
				function toYMD(date){
					var y = date.getFullYear();
					var m = String(date.getMonth() + 1).padStart(2,'0');
					var dd = String(date.getDate()).padStart(2,'0');
					return y + '-' + m + '-' + dd;
				}

				function isHoliday(date){
					// Skip Dec 25 and Jan 1 (month is 0-based)
					var m = date.getMonth();
					var d = date.getDate();
					return (m === 11 && d === 25) || (m === 0 && d === 1);
				}

				var pointer = startOfToday();
				var offset = 0;

				selected.forEach(function (key) {
					var list = bundleMap[key] || [];
					if (!list.length) return;
					var section = $('<div class="mb-3"></div>');
					section.append($('<h4 class="h6"></h4>').text(titleForKey(key)));

					var tableWrap = $('<div class="table-responsive"></div>');
					var table = $('<table class="table table-sm"></table>');
					var thead = $('<thead class="thead-light"><tr><th>Webinar Title</th><th style="width: 260px;">Certificate Date</th></tr></thead>');
					var tbody = $('<tbody></tbody>');

					list.forEach(function (title, idx) {
						var num = idx + 1;
						var id = 'webinarDate-' + key + '-' + num;
						var name = 'webinarDates[' + key + '][' + num + ']';
						var titleId = 'lbl-' + id;

						var tr = $('<tr></tr>');
						var tdTitle = $('<td></td>').append($('<span></span>').attr('id', titleId).text(num + '. ' + title));
						var assigned = addDays(pointer, offset);
						// Skip holidays by advancing until non-holiday
						while (isHoliday(assigned)) {
							offset += 1;
							assigned = addDays(pointer, offset);
						}
						var tdDate = $('<td></td>').append(
							$('<input type="date" class="form-control"/>')
								.attr('id', id)
								.attr('name', name)
								.attr('aria-labelledby', titleId)
								.val(toYMD(assigned))
						);
						tr.append(tdTitle, tdDate);
						tbody.append(tr);
						offset += 1;
					});

					table.append(thead, tbody);
					tableWrap.append(table);
					section.append(tableWrap);
					webinarItems.append(section);
				});

				// Recompute fees after rendering webinars
				computeFees(form);

				// Toggle Submit button visibility based on selections
				var submitBtn = form.find('#submitRegBtn');
				submitBtn.toggleClass('d-none', selected.length === 0);
			}

			function titleForKey(key) {
				switch (key) {
					case 'physics': return 'Physics: Vectors, Motion, & Collision';
					case 'biology': return 'Biology: From Cells to Genetics';
					case 'chemistry': return 'Chemistry: From Electrons to Reactions';
					case 'experiment': return 'Guide to Science Experiment';
					case 'research': return 'Research Writing and Presentation';
					case 'systematic': return 'Conducting Systematic Reviews';
					default: return key;
				}
			}

			// Guard against duplicate bindings and toggle selected highlight
			bundleGroup.off('change', 'input[type="checkbox"]');
			bundleGroup.on('change', 'input[type="checkbox"]', function () {
				var label = $(this).closest('.bundle-item');
				if (label.length) label.toggleClass('active', this.checked);
				render();
			});
			render();
		}

		// Toggle Specialization "Other" input
		function initializeSpecializationOther(form){
			var specSel = form.find('#regSpecialization');
			if (!specSel.length) return;
			var specOther = form.find('#regSpecializationOther');
			if (!specOther.length) {
				specOther = $('<input type="text" class="form-control mt-2 d-none" id="regSpecializationOther" name="specializationOther" placeholder="Please specify your specialization">');
				specSel.after(specOther);
			}
			function updateOther(){
				var isOther = (specSel.val() === 'Other');
				if (isOther){
					specOther.removeClass('d-none').attr('required','required');
					try { specOther[0].focus(); } catch(e){}
				} else {
					specOther.addClass('d-none').removeAttr('required').val('');
				}
			}
			specSel.off('change.specializationOther').on('change.specializationOther', updateOther);
			updateOther();
		}
	});

	// Fees: Auto-compute based on selections and membership status
	function initializeAutoFees(form, caseType){
		form.data('membershipCase', caseType || 'OTHER_TEXT');
		computeFees(form);
	}

	function computeFees(form){
		if (!form || !form.length) return;
		var caseType = form.data('membershipCase') || 'OTHER_TEXT';
		var feesCard = form.find('#feesSummary');
		var feeMembershipEl = form.find('#feeMembership');
		var feeTrainingEl = form.find('#feeTraining');
		var feeTotalEl = form.find('#feeTotal');
		if (!feesCard.length) return;

		// Pricing per bundle (promo prices)
		var bundlePrices = {
			physics: 600,
			biology: 600,
			chemistry: 600,
			experiment: 450,
			research: 600,
			systematic: 450
		};

		// Membership fee for non-members or non-active cases
		var MEMBERSHIP_FEE = 500;
		var membershipFee = (caseType === 'PAPSI_MEMBER_JSON') ? 0 : MEMBERSHIP_FEE;

		// Sum selected bundle prices
		var trainingFee = 0;
		var bundleGroup = form.find('#bundleGroup');
		bundleGroup.find('input[type="checkbox"]:checked').each(function(){
			var key = $(this).val();
			if (bundlePrices.hasOwnProperty(key)) {
				trainingFee += bundlePrices[key];
			}
		});

		var total = membershipFee + trainingFee;

		// Update UI
		feeMembershipEl.text('PHP ' + membershipFee.toLocaleString('en-PH'));
		feeTrainingEl.text('PHP ' + trainingFee.toLocaleString('en-PH'));
		feeTotalEl.text('PHP ' + total.toLocaleString('en-PH'));
		feesCard.toggleClass('d-none', false);
	}


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