$(document).ready(function(){
	
	var contentData = [];
	var spellData = [];
	var spellHtml = [];
	var components = [];
	var dice = [];
	var pageDataUrl;
	var currentPage;
	var pagesData = './data/pagesData.json';
	var handlebarsData=[];

	var path = window.location.pathname;
	currentPage = (path.split("/").pop()).replace('.html', '');
	//console.log("currentPage = " + currentPage);

	function init (){

		loadPages(function(){
			$.when(insertComponents()).done(function(){ 				
				loadData(pageDataUrl);
				insertResults();
 			});			
		});
	};//END init


function loadPages(callback) {
    var request = new XMLHttpRequest();
    request.open('GET', pagesData, true);

    request.onload = function() {
        if (request.status >= 200 && request.status < 400) {
            // Success!
            var data = JSON.parse(request.responseText);

            components = data.components;
            handlebarsData = data.pages;
            dice = data.dice;

            if (currentPage) {
                pageDataUrl = handlebarsData[currentPage].dataUrl;
            } else {
                //REDIRECTS HOMEPAGE TO BESTIARY
                window.location.replace("bestiary.html");
            };

            if (callback) {
                callback();
            };
        } else {
            // We reached our target server, but it returned an error

        }
    };

    request.onerror = function() {
        // There was a connection error of some sort
    };

    request.send();
		/*$.ajax({
	        type: "GET",
	        dataType: "json",
	        url: pagesData,
	        success: function (data){
	        	components = data.components;
		        handlebarsData = data.pages;
		        dice = data.dice;
		        //console.log(handlebarsData[currentPage]);
		        
		        if (currentPage){
					pageDataUrl = handlebarsData[currentPage].dataUrl;
				} else {
					//REDIRECTS HOMEPAGE TO BESTIARY
					window.location.replace("bestiary.html");
				};
	        },
			complete: function (data) {
				if (callback) {
					callback();
				};
			},
	        error: function (error){
	        	//console.log(dataUrl + " failed to load");
	        }
		});*/
	};

	function insertComponents(){
		if (handlebarsData[currentPage].filters) {
			getComponents(components.filters.template, components.filters.div, components.filters.name);
		};
		getComponents(components.header.template, components.header.div, components.header.name);
		getComponents(components.footer.template, components.footer.div, components.footer.name);
		getComponents(components.modal.template, components.modal.div, components.modal.name);
		getComponents(components.diceRoller.template, components.diceRoller.div, components.diceRoller.name);
	};

	function getComponents(templateUrl, div, name){
		$.ajax({
			url: templateUrl,
			cache: true,
			success: function(data){
				var template = Handlebars.compile(data);
				if (name == 'filters' || name == 'diceRoller') {
					// $(div).append(data);
					$(data).insertBefore($(div));
				} else {
					$(div).prepend(data);
				};
			},
			complete: function(data){
				if (name == 'header') {
					for (var key in handlebarsData) {
					   $('#navlinks').append('<li><a href="' + handlebarsData[key].url + '">' + key + '</a></li>')
					}
					$('#mainSearch #live-search-box').attr('placeholder', ('Search ' + currentPage + '...'));

					$('#buttonTitle h4').text("D&D " + currentPage);
				};

				if (name == 'diceRoller') {
					loadDice();
				};
				//console.log(name + ' loaded');
			},
			error: function(error){
				console.log(name + " failed to load");
			}
		});
	};

	function loadDice (){
		var request = new XMLHttpRequest();
	    request.open('GET', './templates/components/dice.handlebars', true);

	    request.onload = function() {
	        if (request.status >= 200 && request.status < 400) {
	            // Success!
	            var resp = request.responseText;
	            var template = Handlebars.compile(resp);

	            for (var i = 0; i < dice.length ; i++) {
					var html = template(dice[i]);
					// $('#eachDice').append(html);
					/*var parent = document.getElementById('eachDice');
					html.appendChild(parent);*/
					console.log(html);
					/*.innerHTML = html;
					console.log(html);*/
				};

	           
	        } else {
	            // We reached our target server, but it returned an error

	        }
	    };

	    request.onerror = function() {
	        // There was a connection error of some sort
	    };

	    request.send();
/*
		$.ajax({
			url: './templates/components/dice.handlebars',
			cache: true,
			success: function(data) {

				var template = Handlebars.compile(data);
				//CONVERTS THE JSON TO HTML AND PUSHES TO NEW ARRAY
				for (var i = 0; i < dice.length ; i++) {
					var html = template(dice[i]);
					$('#eachDice').append(html);
				};
				
				//console.log(spellHtml);
			},

			complete: function (data) {
				//ADDS KEYS FOR EACH CODE BLOCK

				console.log("Dice loaded");
				//console.log(spellHtml);
			},
	        error: function(error){
	        	console.log("Dice failed to load");
	        }              
	    });*/
	};//END loadDice

	function loadData (dataUrl){
		$.ajax({
	        type: "GET",
	        dataType: "json",
	        url: dataUrl,
	        success: function (data){

		        contentData = data;
		        //FIX THIS.....
		        
		        /*for (var i = 0; i < contentData.bestiary.length; i++) {
		        	// console.log(contentData.bestiary[i].source);
		        	if (contentData.bestiary[i].source == 'MM') {
		        		contentData.bestiary[i].source = 'Monster Manual'
		        	}
		        }*/
		        console.log(contentData.bestiary);

		        if (handlebarsData[currentPage].filters) {
		        	$.when(loadTemplates(
			    		handlebarsData[currentPage].filterTemplate, 
			    		handlebarsData[currentPage].filterId, 
			    		contentData.filters
			    	)).then(loadTemplates(
			    		handlebarsData[currentPage].contentTemplate, 
			    		handlebarsData[currentPage].contentId, 
			    		contentData[currentPage],
			    		true	    		
			    	));
			    	
		        } else {
		        	loadTemplates(
			    		handlebarsData[currentPage].contentTemplate, 
			    		handlebarsData[currentPage].contentId, 
			    		contentData[currentPage],
				    	true		    		
			    	);
		        };

		    	if (currentPage == 'bestiary') {
					console.log('this is the ' + currentPage);
					loadSpellData();
				};

				//console.log(contentData)
	        },

			complete: function (data) {
				//console.log('data loaded');
				$('#results').text(contentData[currentPage].length);
				//console.log(contentData);
				
			},

	        error: function (error){
	        	console.log(dataUrl + " failed to load");
	        }
		});
	};

	function loadTemplates(templateUrl, id, array, callback){
	    $.ajax({
			url: templateUrl,
			cache: true,
			success: function(data) {
				var template = Handlebars.compile(data);
				// console.log(data); 
				for (var i = 0; i < array.length ; i++) {
					var html = template(array[i]);
					$(id).append(html);
					// console.log(array[i])
				}; 
			},
			complete: function (data) {
				console.log(templateUrl + ' done')
				if (callback) {
					console.log('callback start')
					insertFunctionality(function(){
						alphabetize();
						allWraps(textReplace);
		    			preLoaderDismiss(function(){
		    				checkShiftSelect();
		    				addToolTip();
	    				});
	    			});
				}; 
			},
	        error: function(error){
	        	console.log(templateUrl + " failed to load");
	        }              
	    });
	};

	function loadSpellData (){
		$.ajax({
	        type: "GET",
	        dataType: "json",
	        url: './data/spellSRD.json',
	        success: function (data){
		        spellData = data.spells;
	        },

			complete: function (data) {
				loadSpellTemplate();
			},

	        error: function (error){
	        	console.log("Spell data failed to load");
	        }
		});
	};//END loadSpellData

	function rename(obj, oldName, newName) {
	    if(!obj.hasOwnProperty(oldName)) {
	        return false;
	    }

	    obj[newName] = obj[oldName];
	    delete obj[oldName];
	    return true;
	};//END rename

	function loadSpellTemplate (){
		$.ajax({
			url: './templates/components/spellsPopover.handlebars',
			cache: true,
			success: function(data) {

				var template = Handlebars.compile(data);
				//CONVERTS THE JSON TO HTML AND PUSHES TO NEW ARRAY
				for (var i = 0; i < spellData.length ; i++) {
					var html = template(spellData[i]);
					spellHtml.push(html);
				};
				
				//console.log(spellHtml);
			},

			complete: function (data) {
				//ADDS KEYS FOR EACH CODE BLOCK

				for (var i = 0; i < spellData.length ; i++) {
					var key = spellData[i].name.toLowerCase();
					rename(spellHtml, i, key);
				};
				//console.log(spellHtml);
			},
	        error: function(error){
	        	console.log("Spell template failed to load");
	        }              
	    });
	};//END loadSpellTemplate

	function insertResults (){
		if (handlebarsData[currentPage].results) {
			$('#contentWrap').prepend('<div id="resultsWrap"><h4><span id="results">0</span> Results</h4></div>');
		};
		
	}//END insertResults DIV

	function preLoaderDismiss (callback){
		//LOOK INTO SLIDE INSTEAD OF FADE
		console.log('Preloader is closed (preLoaderDismiss)');
		$('#loadSpinner, #loadLogo').fadeOut(600);
		$('#preLoader').delay(600).slideUp(400, function(){
			if (callback) {
				callback();
			};
			$('body').css('overflow', 'visible');
		});
	};//END preLoaderDismiss

	//REPLACE TEXT CHARACTER BECAUSE JSON IS DUMB
	function textReplace (){
		console.log('Text has been replaced (textReplace)');
		$('.challenge-ratingWrap h3:contains("-"), .challenge-rating:contains("-")').each(function(){
			$(this).text($(this).text().replace('-', '/'));
		});
		$('.sourceWrap h3:contains("-"), .rarityWrap h3:contains("-"), .typeWrap h3:contains("-"), .hyphen:contains("-")').each(function(){
			$(this).text($(this).text().replace(/-/g, ' '));
		});
		$('.sourceWrap h3:contains("_"), .typeWrap h3:contains("_"), span.underscore:contains("_")').each(function(){
			$(this).text($(this).text().replace(/_/g, "'"));
		});
		$('.commaAdd').each(function(){
			$(this).text($(this).text().replace(/ /g, ', '));
		});
		//FIX COMMAS IN SPELL CLASSES
		$('.content').each(function(){
			var commaReplace = $(this).attr('data-category');
			$(this).attr('data-category', commaReplace.replace(/,/g, ''));	
		});
		$('.challenge-ratingWrap').each(function(){
			if ($(this).attr('id') !== 'Other') {
				$(this).find('h3').prepend('Challenge Rating ');
			};
		});
		$('.levelWrap').each(function(){
			if ($(this).find('h3').text() !== 'cantrip') {
				$(this).find('h3').prepend('Level ');
			} else {
				$(this).find('h3').append('s');
			};
		});
		$('.levelSchool').each(function(){
			$(this).children('span:contains("cantrip")').append(' Cantrip');
			$(this).children('span').text(function () {
			    return $(this).text().replace('Level cantrip ', ''); 
			});
		});
		
		if (currentPage == "bestiary") {
			var abilityScore
			$('.score').each(function(){
				abilityScore = $(this).text();
				$(this).append(' (' + contentData.modifiers[abilityScore] + ')');
			});
		};
	};//END textReplace

	function allWraps (callback){
		insertSortWraps();
		function insertSortWraps () {
			for (var i = 0; i < contentData.filters[0].sort.content.length; i++) {
				if (contentData.filters[0].sort.content[i] !== 'alphabetical') {
					str = contentData.filters[0].sort.content[i];
					sortWrapHtml(contentData.filters[0][str].content, str);
				};
				
			};
		};//END insertSortWraps
		//ADDS WRAPPERS FOR RADIO SORT
		function sortWrapHtml (dataFilters, prefix){
			for (var i = 0; i < dataFilters.length; i++) {
				$('#contentWrap').append('<div id="' + dataFilters[i] +'" class="' + prefix + 'Wrap hideWrap"><div class="sectionWrap group"><h3 class="floatLeft capitalize">' + dataFilters[i] + '</h3><div class="toTopDiv">to top<span class="glyphicon glyphicon-circle-arrow-up" aria-hidden="true"></span></div></div></div>');
			};
		};//END sortWrapHtml	

		if (callback) {
			callback();
		};
	};

	function alphabetize (callback){
		if (handlebarsData[currentPage].alpha) {
			var alphaSort = $('.content').sort(function (a, b) {
				var alphaA = $(a).attr('name');
				var alphaB = $(b).attr('name');

				if (alphaA < alphaB)
					return -1;
				if (alphaA > alphaB)
					return 1;
				return 0;
			});
			$('#contentWrap').append(alphaSort);

			if (callback) {
				callback(arguments[1], arguments[2]);
			};
		}
		
	};//END alphabetize

	//START SHIFT-SELECT
	function checkShiftSelect (){
		var lastChecked = null;
        var shiftSelect = $('input.shiftSelect');
        
        shiftSelect.click(function(e) {
            if(!lastChecked) {
                lastChecked = this;
                return;
            };
            if(e.shiftKey) {
                var start = shiftSelect.index(this);
                var end = shiftSelect.index(lastChecked);

                shiftSelect.slice(Math.min(start,end), Math.max(start,end)+ 1).filter(":visible").prop('checked', lastChecked.checked);
            };
            lastChecked = this;
        });
    };//END SHIFT-SELECT

     function insertPopovers (){
		$(document).on('click', '.spellName', function() {
			var thisName = $(this).attr('name');
			var offset = $(this).offset();
			var percentLeft = offset.left/$(window).width() * 100;
			var popOptions = {
				trigger: 'manual',
				html: 'true',
				placement: 'auto right',
				content: function() {
					return spellHtml[thisName];
				}
			}
			//replace hyphen
			
			$(this).popover(popOptions);
			$(this).popover("show");

			$('.popover').find('.hyphen').text(function(){
				$(this).text($(this).text().replace(/-/g, ' '));
			});
		
		});
		$('html').on('mouseup', function(e) {
			if(!$(e.target).closest('.popover').length) {
				$('.popover').each(function(){
					$(this.previousSibling).popover('hide');
				});
			}
		});
			
    };//END insertPopovers

    //TOOLTIP
	function addToolTip (){
		$('[data-toggle="tooltip"]').tooltip({
			    trigger : 'hover'
			});
		if ( $(window).width() < 768 ){
		    $('[data-toggle="tooltip"]').tooltip('disable');
		} else {
			$('[data-toggle="tooltip"]').tooltip('enable');
			  
		}
	};
	
	function insertFunctionality (callback){
		console.log('Functionality start (insertFunctionality)');
		liveSearch();
		activePage();
		filterContent();
		insertPopovers();
		//rulesLinks();

		function rulesLinks(){
			for (var i = 0; i < contentData[currentPage].length; i++) {
				console.log(contentData[currentPage][i].name);
				var id = 'nav' + contentData[currentPage][i].name;
				$('#contentWrap').prepend('<p id="'+id+'">' + contentData[currentPage][i].name + '</p>');
				for (var j = 0; j < contentData[currentPage][i].content.length; j++) {
					console.log(contentData[currentPage][i].content[j].title);
					$('#' + id).append('<p>' + contentData[currentPage][i].content[j].title + '</p>')

				};
			};
		};
		

		if (currentPage == 'rules') {
			$('#clearFilter, #clearSelected, #viewSelected, #numberSelected, #filterTab').remove();
		};

		function activePage (){
			$('#dropmenu li').each(function(){
				//console.log($(this).text());

				if ($(this).text() == currentPage) {
					//console.log(currentPage)
					$(this).children().addClass('currentPage');
				};
			})
		};//END activePage

		//START FONT-SIZE CHANGE
		$(document).on('click', '#fontWrap .glyphicon-font, #fontWrapModal .glyphicon-font', function(){
			var currentSize = parseInt($('body').css('font-size'));
			var newSize
			if ($(this).hasClass('smaller')) {				
				if (currentSize > 10) {
					newSize = (currentSize - 2) + 'px';
					$('body').css('font-size', newSize);
				};	
			} else if ($(this).hasClass('reset')) {
				$('body').css('font-size', "1.4em");
			} else if ($(this).hasClass('larger')) {
				if (currentSize < 18) {
					newSize = (currentSize + 2) + 'px';
					$('body').css('font-size', newSize);
				};
			};
		});//END FONT-SIZE CHANGE

		//START VIEW SELECTED
		$(document).on('click', '#viewSelected', function(){
			var html 
			var name 
			var colWrap

			$('#displayModal #modalContent').empty();
			var selected = $('.contentSelect input[type="checkbox"]');

			selected.each(function(){	
				if ($(this).prop('checked')) {
					$('#viewCover').fadeIn();
				};
			});

			selected.filter(':checked').each(function(){
				//console.log($(this).attr('value'));
				html = $(this).parents('.content').html();
				name = $(this).parents('.content').attr('name');
				colWrap = ('<div class="col-md-4 modalWrap" name="' + name + '">' + html + '</div>');
				$('#displayModal #modalContent').append(colWrap);
			});

			$('#displayModal .blockWrap').show(0, function(){
				//FIXES HEIGHT SO IT IS DYNAMIC BASED ON WINDOW
				var modalHeight = $('#displayModal').outerHeight();
				var h4Height = $('#displayModal h4.name').outerHeight(true);
				var modalHeaderHeight = $('#modalHeader').outerHeight(true);
				var blockWrapHeight = $('#displayModal .blockWrap').height();
				var blockWrapOuterHeight = $('#displayModal .blockWrap').outerHeight();
				var newHeight = (modalHeight - (h4Height + modalHeaderHeight)) - (blockWrapOuterHeight - blockWrapHeight);
				
				$('.modalWrap .blockWrap').outerHeight(newHeight);
			});

			$('#displayModal h4.name').addClass('nameActive');
			$('#displayModal .contentSelect').hide();
			//$('body').css('overflow', 'hidden');

			$('.modalWrap').each(function(){
				var glyphToggle = $(this).find('span.glyphicon-chevron-down');
				if (glyphToggle.hasClass('glyphicon-chevron-down')) {
					glyphToggle.removeClass('glyphicon-chevron-down');
					glyphToggle.addClass('glyphicon-chevron-up');
				};

				$(this).prepend('<button type="button" class="contentClose close" aria-label="Close"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></button>');
			});
			$(this).blur();
		});//END VIEW SELECTED
		
		//START Close view selected modal content
		$(document).on('click', '.contentClose', function(){
			//var name = $(this).find('input').attr('value');
			//console.log('Click');
			$(this).parent().fadeOut().remove();
			name = ($(this).parent().attr('name'));
			if ($('#modalContent').html().length == 0) {
				$('#viewCover').fadeOut();
				//$('body').css('overflow', 'visible');
			};
			$('.content .contentSelect input[type="checkbox"]').filter(':checked').each(function(){
				//console.log($(this).attr('value'));
				if ($(this).attr('value') == name) {
					$(this).prop('checked', false);
				};
			});
			numberSelected();
			
		});//END contentClose for modal

		//Close modal
		$(document).on('click', '.modalClose', function(){
			//var name = $(this).find('input').attr('value');
			//console.log('Click');
			$(this).closest('.cover').fadeOut();
			//$('#cover').fadeOut();
			//$('body').css('overflow', 'visible');
			
		});//END close modal

		//collapse dropdown on mouse click
		$('html').on('mouseup', function() {
			if ($('#dropmenu').is(':visible')) {
				$('#dropmenu').collapse('hide');
			};
		});//END collapse dropdown on mouse click

		//START numberSelected
		function numberSelected(){
			var i = 0;
			$('.contentSelect input[type="checkbox"]').filter(':checked').each(function(){
				//console.log($(this).attr('value'));
				i++
			});
			console.log("number checkbox  = " + i);
			$('#numberSelected span').text(i);
		};//END numberSelected
		
		$(document).on('click', '.contentSelect', function(){
			//var name = $(this).find('input').attr('value');
			numberSelected();
		});//END CONTENT CHECK

		//START FLYOUT TOGGLE
		$(document).on('click', '#filterTab', function(){
			// var tabName = '#flyoutFilter';
			$(this).blur();
			// $('#filterTab, .flyoutTab').unbind('mouseout');

			filterToggle();
			
			
		});//END FLYOUT TOGGLE

		$(document).on('click', '#filterHeader .close', function(){
			filterToggle();
			$(this).blur();
		})

		function filterToggle(){
			$('.tooltip:last').remove();
			if ($('.target').hasClass('toggle')){
				$('.target').removeClass('toggle');
				// $('#flyoutFilter').fadeOut();
				if ( $(window).width() < 768 ){
			    	$('#flyoutFilter').fadeOut();
				} else {
					$('#flyoutFilter').animate({'left':'-33%'});
					$('#contentWrap, header, footer, #buttonsWrap').animate({'width':'100%'});
				}
				$('#filterTab').attr('data-original-title', 'Open filters').tooltip('fixTitle',"destory");
				
			} else {
				$('.target').addClass('toggle');
				//$('#flyoutFilter').fadeIn();
				if ( $(window).width() < 768 ){
			    	$('#flyoutFilter').fadeIn();
				} else {
					$('#flyoutFilter').animate({'left':'0%'});
					$('#contentWrap, header, footer, #buttonsWrap').animate({'width':'67%'});
					$('#filterTab').attr('data-original-title', 'Close filters').tooltip('fixTitle');
				};
			};
		}

		//START GLYPHTOGGLE
		$(document).on('click', 'h4.name', function(){
			$(this).each(function(){
				var glyphToggle = $(this).find('span.glyphicon');
				$(this).next().slideToggle(300);
				$(this).toggleClass('nameActive');
				if (glyphToggle.hasClass('glyphicon-chevron-down')) {
					glyphToggle.removeClass('glyphicon-chevron-down');
					glyphToggle.addClass('glyphicon-chevron-up');
				} else {
					glyphToggle.removeClass('glyphicon-chevron-up');
					glyphToggle.addClass('glyphicon-chevron-down');
				};
			});
		});//END GLYPHTOGGLE

		function h4Reset (){
			$('h4.name').removeClass('nameActive');
			$('.blockWrap').hide();
			if ($('#contentWrap h4 .glyphicon').hasClass('glyphicon-chevron-up')){
	        	$('#contentWrap h4 .glyphicon').removeClass('glyphicon-chevron-up');
	        	$('#contentWrap h4 .glyphicon').addClass('glyphicon-chevron-down');
	        };
		}; //END h4Reset
		
		function liveSearch(){
			$('#live-search-box').keyup(function () {
	            h4Reset();
			    searchVal = $('#live-search-box').val().toLowerCase();
			   
		    	$('h4.name').each(function() {
		        var title = $(this).text().toLowerCase();
			        if (title.indexOf(searchVal) < 0) {
			            $(this).parent('.content').addClass('hide');         
			        } else {
			        	$(this).parent('.content').removeClass('hide');
			        };
			    });
			    numberResults();
			    hideWrap();
			});			 
		}; //END liveSearch

		//MOVE SEARCH ON MOBILE
		$(window).resize(function(){
			
			addToolTip();
		});

		$('#clearSearch').click(function(){
			$('#live-search-box').val('').keyup();
			$(this).blur();
		});//END CLEAR SEARCH

		function filterContent (){
			//console.log("filterContent Loaded");
			var filterCheckboxes = $('#filterWrap input[type="checkbox"]');

			//Whenever a change is detected on a checkbox, do some stuff
			filterCheckboxes.on('change', function(){
				h4Reset();

				//First we empty out the array selectedFilters so we don't get duplicates
				selectedFilters = {};
				//console.log(selectedFilters);

				//This goes through the "checked" boxes and adds it to selectedFilters if it hasn't been added yet.
				filterCheckboxes.filter(':checked').each(function(){

					//if selectedFilters does NOT (!) have a property that matches the checkbox name, then it adds that property to selectedFilters and makes it an array "[]"
					if (!selectedFilters.hasOwnProperty(this.name)) {
						selectedFilters[this.name] = [];
						//console.log(selectedFilters[this.name]);
					};
					//add value of "checked" checkbox to selectedFilters based on the property name, and pushes that value to the array. EX: if size medium and large are clicked, it will look like this "size": ["medium","large"]
					selectedFilters[this.name].push(this.value);
					
				});
				//console.log(selectedFilters);

				//BREAK OUT TO NEW FUNCTION HERE?
				var filteredResults = $('.content');

				//This goes through selectedFilters and returns the name (pulled from the checkbox "name" attribute) of the object and value ("filterValues") -- (value is pulled from the checkbox "value" attribute)
				$.each(selectedFilters, function(name, filterValues){
					filteredResults = filteredResults.filter(function(){
						var matched = false;

						//This goes through all of the $('.content') divs (in "var filterResults") takes the data-category attribute and pushes each one into an array, separating (split) each one at a space (' '). 
						var currentFilterValues = $(this).data('category').split(' ');
						//var theName = $(this).attr('name');
						//console.log(theName + " has values: " + currentFilterValues);
						//Now that currentFilterValues is an array, we can go through each index
						$.each(currentFilterValues, function(index, currentFilterValues){
							
							//if any of the filterValues from selectedFilters match any of the values in currentFilterValues, matched will be true;
							if ($.inArray(currentFilterValues, filterValues) != -1) {
								matched = true;
								//console.log(theName + " is matched");
								//console.log(index + ":" + currentFilterValues);
								//return false;
							};

						});
						//console.log(theName + " match = " + matched);
						
						return matched;
					});
				});
				//Hides all the content blocks based on the data in filteredResults
				$('.content').hide().filter(filteredResults).show();

				hideWrap();
				numberResults();
			});	
		};//END filterContent
				
		function hideWrap (){
			$('.hideWrap').each(function(){
				$(this).show();
				if ($(this).children('.content:visible').length === 0) {
					$(this).hide();
				};
			});	
		};//END hideWrap

		function numberResults (){
			var results = $('.content:visible').length;
			$('#results').text(results);
		};
	
		//SORT BY RADIOS 
		$(document).on('change', '#filterDiv input[type=radio]', function(){
			h4Reset();
			//console.log("radio change");
			$('.hideWrap, .glyphicon-link').hide();
				
			var wrapPrefix = $(this).attr('id');
			var radioId = $('#' + wrapPrefix);
			var sortClass = $('.' + wrapPrefix + 'Wrap');

			if (wrapPrefix !== 'alphabetical' && radioId.is(':checked')) {
				sortClass.show();
		        $('#' + wrapPrefix + ' .glyphicon-link').show();
		        alphabetize(sortWrap, contentData.filters[0][wrapPrefix].content, wrapPrefix);
		    } else {
		    	alphabetize();
		    };
		    hideWrap();
		});//END RADIO SORT

		$('#clearFilter').click(function(){
			$('#filterWrap input[type="checkbox"]').removeAttr('checked');
			// $('#live-search-box').val('');
			// $('#live-search-box').keyup();
			$('input#alphabetical').prop( "checked", true);
			//MAKE INTO FUNCTION???
				$('.hideWrap').hide();
		    	$('.glyphicon-link').hide();
		    	//$('#viewSelected').hide();
			
			//Remove focus from button because it's ugly
			$(this).blur();
			//Runs filter after checkboxes cleared
			//IS THIS NEEDED????
			filterContent();
			//Shows all content
			$('.content').show();
			//Alphabetize content
			h4Reset();
			alphabetize();
			numberResults();
		});//END CLEAR FILTER

		$('#clearSelected').click(function(){
			$('#contentWrap input[type="checkbox"]').prop('checked', false);
			//Remove focus from button because it's ugly
			$(this).blur();
			h4Reset();
			numberSelected();
		});//END CLEAR FILTER
		
		function sortWrap(dataFilters, sortValue){
			$('.content').each(function(){
				for (var i = 0; i < dataFilters.length; i++) {
					if ($(this).attr('data-' + sortValue) == dataFilters[i]){
						$('#' + dataFilters[i] ).append($(this));
					};
				};
			});
		};//END sortWrap

		//SMOOTH SCROLL
		$('.checkbox a').click(function(){
			var target = $(this).attr('href');
			var targetTop = $(target).offset().top;
				$('html, body').animate({
				scrollTop: (targetTop)
				}, 500);
				return false;
		});//END SMOOTH SCROLL

		//TO TOP BUTTON
		$(document).on('click', '.toTopDiv, #toTop', function(){
			$('html, body').animate({scrollTop: 0}, 500);
			$(this).blur();
		});//END TO TOP BUTTON

		//START DICE ROLLER
		$(document).on('click', '.roll', function(){
			//This is which dice is rolled
			var value = $(this).val();
			//This is the number of dice rolled
			var diceCount = $('[name="' + value + '"]').val();
			//this is the modifier to add to each roll
			var modifier = $('[name="' + value + 'mod"]').val();
			//This is the dice value
			var diceVal = $('[name="' + value + 'val"]').attr('value');
			//This produces a random number between 1 and the diceVal
			
			if (diceCount > 0) {
				eachRoll = [];
				var total = 0;
				for (var i = 0; i < diceCount; i++) {
					var roll = Math.floor(Math.random()*diceVal) + 1;
					eachRoll.push(roll);
				};
				
				for (var i = 0; i < eachRoll.length; i++) {
					total += eachRoll[i];
				};
					total += parseInt(modifier);
				console.log(eachRoll + "+" + modifier);
				$('#rollResults').val("Roll (" + diceCount + value + ')' + '+' + modifier + ':\n' + eachRoll + ',+' + modifier + '\nTotal:' + total + "\n\n" + $('#rollResults').val());

				$('#' + value + 'result').val(total);
			};
		});//END DICE ROLLER

		//START SHOW DICE ROLLER
		$(document).on('click', '#roller', function(){
			$('#diceCover').fadeIn();
			$(this).blur();
		});//END SHOW DICE ROLLER

		$('.resetDice').click(function(){

			$('#diceModal .input-number').each(function(){
				$(this).val($(this).data('original-value'));
			});
			 $('#rollResults').val('');
		});	

		if (callback) {
			callback();
		};
		
	};// END INSERT FUNCTIONALITY

	

	/*------ How to sort then convert array to string ------*/

		/*//  1.   CREATES NEW ARRAY THAT IS ALPHABETIZED BY NAME
		var newArray = creatureList.sort(function(a, b){
			var nameA = a.name.toLowerCase(), nameB = b.name.toLowerCase()
			if (nameA < nameB)
				return -1
			if (nameA > nameB)
				return 1
			return 0
		});

		//  2.  THEN STRINGIFY NEW ARRAY
		var myJsonString = JSON.stringify(newArray);

		//  3.  REPLACE TEXT IN BODY WITH NEW STRING ARRAY
		$('body').text(myJsonString);

		//  4.  COPY ALL TEXT, AND PASTE INTO JSON BEAUTIFIER*/



		/*//  1.   CREATES NEW ARRAY THAT IS SORTED BY CR
		var newArray = creatureList.sort(function(a, b){
			var crA = parseInt(a.cr), crB = parseInt(b.cr)
			if (crA < crB)
				return -1
			if (crA > crB)
				return 1
			return 0
		});

		//  2.  THEN STRINGIFY NEW ARRAY
		var myJsonString = JSON.stringify(newArray);

		//  3.  REPLACE TEXT IN BODY WITH NEW STRING ARRAY
		$('body').text(myJsonString);

		//  4.  COPY ALL TEXT, AND PASTE INTO JSON BEAUTIFIER*/

	/*------ End sort and convert instructions ------*/


	/*------ FULL LIST OF POSSIBLE ALIGNMENTS ------*/
	/*"any alignment",
	"any chaotic alignment",
	"any evil alignment",
	"any non-good alignment",
	"any non-lawful alignment",
	"chaotic evil",
	"chaotic good",
	"chaotic good (75%) or neutral evil (25%)",
	"chaotic neutral",
	"lawful evil",
	"lawful good",
	"lawful neutral",
	"neutral",
	"neutral evil",
	"neutral good",
	"neutral good (50%) or neutral evil (50%)",
	"unaligned"*/
    /*var SRD = []
	$('.contentSelect input').each(function(){
		if ($(this).is(':checked')) {
			SRD.push($(this).val())
		}
	})*/

	init();
})/*.ajaxComplete(function(){
	console.log(event.target.responseURL);
})*/;