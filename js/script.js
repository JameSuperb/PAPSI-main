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

		// Cache for member trainings and CSV map
		form.data('memberTrainings', []);
		form.data('csvMapLoaded', false);
		form.data('csvMap', {});

		function normalizeTitle(t){
			var s = (t || '').toString().toLowerCase();
			// Trim
			s = s.trim();
			// Replace smart quotes and dashes
			s = s.replace(/[\u2018\u2019\u201A\u201B]/g, "'").replace(/[\u201C\u201D\u201E]/g, '"');
			s = s.replace(/[\u2013\u2014\u2212]/g, '-');
			// Convert ampersand to 'and'
			s = s.replace(/&/g, ' and ');
			// Remove punctuation commonly differing between CSV and DOM
			s = s.replace(/[\.,:;!\?\(\)\[\]\{\}]/g, ' ');
			// Collapse multiple whitespace/dashes
			s = s.replace(/[-\s]+/g, ' ').trim();
			return s;
		}

		function parseMemberTrainings(trainingsText){
			if (!trainingsText) return [];
			// Split by " | " with spaces around pipe; be tolerant of extra spaces
			return trainingsText.split(/\s*\|\s*/).map(function(s){ return normalizeTitle(s); }).filter(function(s){ return s.length; });
		}

		function loadCsvMapOnce(){
			if (form.data('csvMapLoaded')) return Promise.resolve(form.data('csvMap'));
			// Robust CSV parser supporting quoted fields and commas inside quotes
			function parseCSV(text){
				var rows = [];
				var row = [];
				var field = '';
				var inQuotes = false;
				for (var i = 0; i < text.length; i++){
					var ch = text[i];
					if (ch === '"'){
						if (inQuotes && text[i+1] === '"'){
							field += '"';
							i++;
						} else {
							inQuotes = !inQuotes;
						}
					} else if (ch === ',' && !inQuotes){
						row.push(field);
						field = '';
					} else if ((ch === '\n' || ch === '\r') && !inQuotes){
						if (ch === '\r' && text[i+1] === '\n') { i++; }
						row.push(field);
						rows.push(row);
						row = [];
						field = '';
					} else {
						field += ch;
					}
				}
				// push last field/row if any
				if (field.length > 0 || row.length > 0) { row.push(field); rows.push(row); }
				return rows.filter(function(r){ return r && r.join('').trim().length; });
			}

			var url = 'files/webinartrainingtitle.csv?ts=' + Date.now();
			return fetch(url, { cache: 'no-store' })
				.then(function(resp){ return resp.text(); })
				.then(function(text){
					var rows = parseCSV(text);
					if (!rows.length) { form.data('csvMapLoaded', true); return {}; }
					// Assume first row is header
					var map = {};
					for (var i=1; i<rows.length; i++){
						var cols = rows[i];
						if (!cols || cols.length < 3) continue;
						var webinarRaw = (cols[0] || '').trim();
						var trainingRaw = (cols[1] || '').trim();
						var costRaw = (cols[2] || '').trim();
						var costNum = parseFloat(costRaw.replace(/[^0-9.\-]/g,''));
						if (!isFinite(costNum)) costNum = 0;
						map[normalizeTitle(webinarRaw)] = {
							webinarRaw: webinarRaw,
							trainingRaw: trainingRaw,
							trainingLower: normalizeTitle(trainingRaw),
							cost: costNum
						};
					}
					form.data('csvMap', map);
					form.data('csvMapLoaded', true);
					return map;
				})
				.catch(function(){
					form.data('csvMapLoaded', true);
					form.data('csvMap', {});
					return {};
				});
		}

		var emailInput = form.find('#regEmail');
		var titleInput = form.find('#regTitle');
		var firstNameInput = form.find('#regFirstName');
		var miInput = form.find('#regMI');
		var lastNameInput = form.find('#regLastName');
		var suffixInput = form.find('#regSuffix');
		var enterBtn = form.find('#promoEnterBtn');

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

		enterBtn.on('click', function () {
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
			enterBtn.prop('disabled', true).text('Processing...');

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
						enterBtn.after(feedback);
					}
					feedback.text(message).removeClass('text-danger').addClass('text-success');

					// Always proceed to expanded details regardless of case
					enterBtn.addClass('d-none');
					var expanded = form.find('#promoExpanded');
						if (expanded.length) {
						expanded.removeClass('hidden');
							// Move success feedback above "Additional Details" heading
							var heading = expanded.find('h3.h5').first();
							if (heading.length) {
								feedback.addClass('mb-2');
								heading.before(feedback);
							}
						initializeBundleRendering(form);
						initializeSpecializationOther(form);
							initializeSubmitValidation(form);
						// Initialize fees with membership status and zero training prior to selection
						initializeAutoFees(form, caseType);
						if (caseType === 'PAPSI_MEMBER_JSON' && jsonData) {
							// Parse member trainings list (json field: trainings)
							var trainingsText = (jsonData.trainings || '').trim();
							var trainList = parseMemberTrainings(trainingsText);
							form.data('memberTrainings', trainList);
							// Load CSV mapping early
							loadCsvMapOnce().then(function(){
								// Re-render to apply exclusions if bundles already selected
								initializeBundleRendering(form);
								computeFees(form);
							});
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
							form.data('memberTrainings', []);
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
						enterBtn.after(feedback);
					}
					feedback.text('Network error. Please try again.').removeClass('text-success').addClass('text-danger');
					// Proceed to expanded details with blank form on network error
					enterBtn.addClass('d-none');
					var expanded = form.find('#promoExpanded');
					if (expanded.length) {
						expanded.removeClass('hidden');
						initializeBundleRendering(form);
						initializeSpecializationOther(form);
						initializeSubmitValidation(form);
						initializeAutoFees(form, 'OTHER_TEXT');
						form.find('#regSpecialization').val('');
						form.find('#regSchoolName').val('');
						form.find('#regSchoolType').val('');
						form.find('#regSchoolAddress').val('');
						form.find('#bundleGroup input[type="checkbox"]').prop('checked', false);
						form.find('#webinarItems').empty();
						form.data('memberTrainings', []);
					}
				})
				.finally(function () {
					enterBtn.prop('disabled', false).text('Enter');
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

				var csvMap = form.data('csvMap') || {};
				var memberTrainings = form.data('memberTrainings') || [];
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
						var normKey = normalizeTitle(title);
						var mapping = csvMap[normKey] || null;
						var trainingLower = mapping ? mapping.trainingLower : null;
						var isExcluded = !!(trainingLower && memberTrainings.indexOf(trainingLower) !== -1);
						var tdTitleText = num + '. ' + title + (isExcluded ? ' — You have already attended this webinar and so this webinar is excluded on the training bundle' : '');
						var tdTitle = $('<td></td>').append($('<span></span>').attr('id', titleId).text(tdTitleText));
						var assigned = addDays(pointer, offset);
						// Skip holidays by advancing until non-holiday
						while (isHoliday(assigned)) {
							offset += 1;
							assigned = addDays(pointer, offset);
						}
						var dateInput = $('<input type="date" class="form-control"/>')
							.attr('id', id)
							.attr('name', name)
							.attr('aria-labelledby', titleId);
						// Attach normalized key and potential cost
						tr.attr('data-webinarkey', normKey);
						if (mapping && !isExcluded) {
							tr.attr('data-cost', String(mapping.cost));
						} else {
							tr.attr('data-cost', '0');
						}
						if (isExcluded) {
							dateInput.val('')
								.prop('disabled', true)
								.addClass('excluded-input');
							tr.addClass('excluded');
						} else {
							dateInput.val(toYMD(assigned));
							// Only advance offset for non-excluded webinars
							offset += 1;
						}
						var tdDate = $('<td></td>').append(dateInput);
						tr.append(tdTitle, tdDate);
						tbody.append(tr);
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
				// Ensure fees recompute even if render short-circuits
				computeFees(form);
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

		// Submit button validations: required fields and total > 0
		function initializeSubmitValidation(form){
			var submitBtn = form.find('#submitRegBtn');
			if (!submitBtn.length) return;
			submitBtn.off('click.promoSubmit').on('click.promoSubmit', function(e){
				e.preventDefault();
				// Elements
				var specSel = form.find('#regSpecialization');
				var specOther = form.find('#regSpecializationOther');
				var schoolName = form.find('#regSchoolName');
				var schoolType = form.find('#regSchoolType');
				var schoolAddr = form.find('#regSchoolAddress');
				var bundleGroup = form.find('#bundleGroup');
				var feesCard = form.find('#feesSummary');

				// Clear previous errors
				[emailInput, titleInput, firstNameInput, lastNameInput, specSel, specOther, schoolName, schoolType, schoolAddr].forEach(function(el){ clearInlineError(el); });
				bundleGroup.siblings('.form-text.text-danger').remove();
				feesCard.siblings('.form-text.text-danger').remove();

				var hasError = false;
				function setError(el, msg){
					showInlineError(el, msg);
					if (!hasError && el && el.length) {
						try { el[0].focus(); } catch(e){}
					}
					hasError = true;
				}
				function parsePhp(text){
					var n = parseFloat(String(text || '').replace(/[^0-9\.\-]/g, ''));
					return isFinite(n) ? n : 0;
				}

				// Email
				var email = (emailInput.val() || '').trim();
				if (!email) setError(emailInput, 'Please enter your email address.');
				else if (!isValidEmail(email)) setError(emailInput, 'Email address looks incorrect.');

				// Title
				var titleVal = (titleInput.val() || '').trim();
				if (!titleVal) setError(titleInput, 'Please select or enter your title.');

				// Names
				if (!(firstNameInput.val() || '').trim()) setError(firstNameInput, 'Please enter your first name.');
				if (!(lastNameInput.val() || '').trim()) setError(lastNameInput, 'Please enter your last name.');

				// Specialization
				var specVal = (specSel.val() || '').trim();
				if (!specVal) setError(specSel, 'Please select your specialization.');
				if (specVal === 'Other'){
					var specOtherVal = (specOther.val() || '').trim();
					if (!specOtherVal) setError(specOther, 'Please specify your specialization.');
				}

				// School details
				if (!(schoolName.val() || '').trim()) setError(schoolName, 'Please enter the name of your school.');
				if (!(schoolType.val() || '').trim()) setError(schoolType, 'Please select the type of school.');
				if (!(schoolAddr.val() || '').trim()) setError(schoolAddr, 'Please enter the address of your school.');

				// Bundles
				var selectedBundles = bundleGroup.find('input[type="checkbox"]:checked').length;
				if (selectedBundles === 0) setError(bundleGroup, 'Please select at least one training bundle.');

				// Total must not be zero
				var totalVal = parsePhp(form.find('#feeTotal').text());
				if (totalVal <= 0) {
					showInlineError(feesCard, 'Total is zero. Please pick training bundles.');
					if (!hasError && feesCard.offset()) {
						window.scrollTo({ top: Math.max(0, feesCard.offset().top - 40), behavior: 'smooth' });
					}
					hasError = true;
				}

				if (hasError) return;

				// All validations passed
				var submitFeedback = form.find('.submit-feedback');
				if (!submitFeedback.length) {
					submitFeedback = $('<div class="submit-feedback mt-2 text-success"></div>');
					submitBtn.after(submitFeedback);
				}
				submitFeedback.text('All required fields are valid.');
			});
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

		// Membership fee for non-members or non-active cases
		var MEMBERSHIP_FEE = 500;
		var membershipFee = (caseType === 'PAPSI_MEMBER_JSON') ? 0 : MEMBERSHIP_FEE;

		var trainingFee = 0;
		var csvLoaded = !!form.data('csvMapLoaded');
		var csvMap = form.data('csvMap') || {};
		if (caseType === 'PAPSI_MEMBER_JSON') {
			if (csvLoaded && Object.keys(csvMap).length) {
				// Sum costs from data attributes for non-excluded rows
				var itemsContainer = form.find('#webinarItems');
				itemsContainer.find('tbody tr').each(function(){
					var tr = $(this);
					if (tr.hasClass('excluded')) return;
					var costAttr = tr.attr('data-cost');
					var costVal = parseFloat((costAttr || '0').replace(/[^0-9\.\-]/g, ''));
					if (isFinite(costVal)) trainingFee += costVal;
				});
			} else {
				// CSV not yet ready for old member; keep trainingFee at 0 for now.
			}
		} else {
			// Fallback to original per-bundle pricing for non-members/new members
			var bundlePrices = {
				physics: 600,
				biology: 600,
				chemistry: 600,
				experiment: 450,
				research: 600,
				systematic: 450
			};
			var bundleGroup = form.find('#bundleGroup');
			bundleGroup.find('input[type="checkbox"]:checked').each(function(){
				var key = $(this).val();
				if (bundlePrices.hasOwnProperty(key)) {
					trainingFee += bundlePrices[key];
				}
			});
		}

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