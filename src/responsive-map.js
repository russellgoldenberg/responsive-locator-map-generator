(function() {
	'use strict';
	var _input;
	var _output;
	var _failed;
	var _mapId;
	var _coords;
	var _demo = '42.3155726,-71.0488811';
	var _options = {
		zoom: 11,
		popup: null,
		icon: null
	};
	var _copy = {
		hed: 'Hed',
		subhed: 'Subhed goes here.',
		credit: 'Globe Staff',
		sourcePre: 'SOURCE',
		sourcePost: 'Sources'
	};

	function init() {
		bindEvents();
	}

	function bindEvents() {
		$('.generate').on('click', function(e) {
			e.preventDefault();	
			_failed = false;

			var val = $('.address').val().trim();
			_input = parseInput(val);

			if(_input.kind === 'address') {
				getCoordinates(_input.value, function(err,coords) {
					if(err) {
						alert(err);
					} else {
						_coords = coords;
						createMap();
					}
				});
			} else {
				_coords = _input.value;
				createMap();
			}
			return false;
		});

		$('.demo').on('click', function(e) {
			e.preventDefault();
			$('.address').val(_demo);
			return false;
		});

		$('.generate-code').on('click', function() {
			generateCode();
		});
	}

 	function parseInput(str) {
 		var isCoords = function(str) {
			var possible = str.match(/-?\d+\.\d+/g);
			if(!possible) {
				return false;
			} else {
				var letters = str.match(/[a-zA-Z]/);
				return !letters;
			}
		};

		var coords = isCoords(str);
		var kind = coords ? 'coordinates' : 'address';
		var output = str;
		return { kind: kind, value: str };
	}

	function getCoordinates(str, cb) {
		var base = 'http://api.tiles.mapbox.com/v4/geocode/mapbox.places/';
		var token = '.json?access_token=pk.eyJ1IjoiZ2FicmllbC1mbG9yaXQiLCJhIjoiVldqX21RVSJ9.Udl7GDHMsMh8EcMpxIr2gA'
		var url = base + str.replace(/\W/g, '+') + token;
		$.getJSON(url, function(response) {
			console.log(response);
			if(response) {
				if(response.features && response.features.length) {
					var coords = response.features[0].center[0] +  ',' + response.features[0].center[1];
					cb(null, coords);	
				} else {
					cb('could not find anything');
				}
			} else {
				cb('error, try again later');
			}
		});
	}

	function createMap() {
		var $container = $('<div class="rg-container"></div>');
		var $header = $('<div class="rg-header"></div>');
		var $hed = $('<div contenteditable="true" class="rg-hed">' + _copy.hed + '</div>');
		var $subhed = $('<div contenteditable="true" class="rg-subhed">' + _copy.subhed + '</div>');
		var $content = $('<div class="rg-content"></div>');
		// var $sourceCredit = $('<div class="rg-source-and-credit"></div>');
		// var $source = $('<div contenteditable="true" class="rg-source"><span class="pre-colon">' + _copy.sourcePre + '</span>: <span class="post-colon">' + _copy.sourcePost + '</span></div>');
		// var $credit = $('<div contenteditable="true" class="rg-credit">' + _copy.credit + '</div>');
		
		var $inlineStyle = '<style>@@include("../.tmp/map-style.css")</style>';

		_mapId = createId(_coords);

		var mapContent = '';
		mapContent += '<div class="rg-map">';
		mapContent += '<div class="rg-map-container" id="rg-map-' + _mapId + '"';
		mapContent += 'data-coords="' + _coords + '"';
		mapContent += 'data-popup="' + 'Enter text to go here in options below or leave blank to remove' + '"';
		mapContent += '>'
		mapContent += '</div>';
		mapContent += '</div>'
		mapContent += '<script src="http://apps.bostonglobe.com/common/js/locator-map/locator-map-0.1.0.js" type="text/javascript"></script>';

		$content.append(mapContent);

		// $sourceCredit.append($source);
		// $sourceCredit.append($credit);
		$header.append($hed);
		$header.append($subhed);
		
		$container.append($inlineStyle);
		$container.append($header);
		$container.append($content);
		// $container.append($sourceCredit);

		$('.preview-map').empty().append($container);
		$('.preview').removeClass('hide');

		var scrollTo = $('.preview').offset().top - 10;
		$('html, body').animate({
			scrollTop: scrollTo
		}, 250);
	}

	function generateCode() {
		updateCopy();
		updateOptions();
		_mapId = createId(_coords);

		var html = '';

		var css = '@@include("../.tmp/map-style.css")';

		html += '<style>' + css + '\n</style>';

		html += '\n<div class="rg-container">';
		html += '\n\t<div class="rg-header">';

		if(_copy.hed.length > 0 ) {
			html += '\n\t\t<div class="rg-hed">' + _copy.hed + '</div>';	
		}
		if(_copy.subhed.length > 0 ) {
			html += '\n\t\t<div class="rg-subhed">' + _copy.subhed + '</div>';	
		}
		html += '\n\t</div>';
		html += '\n\t<div class="rg-content">';

		html += '\n\t\t<div class="rg-map">';
		html += '\n\t\t\t<div class="rg-map-container" id="rg-map-' + _mapId + '"';
		html += ' data-coords="' + _coords + '" ';
		if(_options.popup) {
			html += 'data-popup="' + _options.popup + '" ';	
		}
		if(_options.icon) {
			html += 'data-icon="' + _options.icon + '"';		
		}
		html += '>';
		html += '\n\t\t\t</div>';
		html += '\n\t\t</div>';
		html += '\n\t</div>';
		html += '\n</div>';
		html += '\n<script src="http://apps.bostonglobe.com/common/js/locator-map/locator-map-0.1.0.js" type="text/javascript"></script>';

		$('.output-code').val(html);
		$('.final').removeClass('hide');
	}

	function updateCopy() {
		_copy.hed = $('.rg-hed').text();
		_copy.subhed = $('.rg-subhed').text();
		// _copy.credit = $('.rg-credit').text();
		// _copy.sourcePre = $('.rg-source .pre-colon').text();
		// _copy.sourcePost = $('.rg-source .post-colon').text();
	}

	function updateOptions() {
		var popup = $('.option-popup').val().trim();
		var icon = $('.option-icon').val().trim().toLowerCase().replace(/\s/g, '-');
		_options.zoom = window.getMapZoomLevel();
		_options.popup = popup || null;
		_options.icon = icon || null;
		
		console.log(_options);
	}

	function customize(input) {
		if(input.hideColumns) {
			var names = input.hideColumns.split(',');
			input.hideColumns = {};
			for(var i = 0; i < names.length; i++) {
				input.hideColumns[names[i].trim()] = true;
			}
		} else {
			input.hideColumns = {};
		}

		_input = input;
		createTable();
	}

	function createId(coords) {
		coords = coords.replace(/\D/g, '');
		var id = '';
		for(var i = 0; i < coords.length; i += 3) {
			id += coords[i];
		}
		return id;
	}

	init();
})();