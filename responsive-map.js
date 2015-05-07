(function() {
	'use strict';
	var _filepath;
	var _version = '0.1.1';
	var _input;
	var _output;
	var _failed;
	var _mapId;
	var _coords;
	var _demo = '42.3155726,-71.0488811';
	var _options = {
		zoom: 11,
		popup: null,
		icon: null,
		fullwidth: null
	};
	var _copy = {
		hed: 'Hed',
		subhed: 'Subhed goes here.',
		credit: 'Globe Staff',
		sourcePre: 'SOURCE',
		sourcePost: 'Sources'
	};

	function init() {
		_filepath = window.location.hostname === 'localhost' ? 'src/' : 'http://apps.bostonglobe.com/common/js/locator-map/';
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

		$('.option-fullwidth').on('click', function() {
			_options.fullwidth = true;
			$('.inline button').removeClass('selected');
			$(this).addClass('selected');
		});

		$('.option-inline').on('click', function() {
			_options.fullwidth = false;
			$('.inline button').removeClass('selected');
			$(this).addClass('selected');
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
					var coords = response.features[0].center[1] +  ',' + response.features[0].center[0];
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
		
		var $inlineStyle = '<style>/*styles for graphic info (hed, subhed, source, credit)*/\n.rg-container {\n\twidth: 100%;\n\tfont-family: Helvetica, Arial, sans-serif;\n\tfont-size: 16px;\n\tline-height: 1;\n\tmargin: 1em 0;\n\tpadding: 0.75em 0 0 0;\n\tcolor: #1a1a1a;\n\tborder-top: 1px solid #ccc;\n\tclear: both;\n}\n.rg-header {\n\tmargin-bottom: 0.5em;\n}\n.rg-hed {\n\tfont-family: "Benton Sans Bold", Helvetica, Arial, sans-serif;\n\tfont-weight: bold;\n\tfont-size: 1.35em;\n}\n.rg-subhed {\n\tfont-size: 1em;\n\tline-height: 1.4em;\n}\n.rg-source-and-credit {\n\tfont-family: Georgia,"Times New Roman", Times,serif;\n\twidth: 100%;\n\toverflow: hidden;\n\tmargin-top: 1em;\n}\n.rg-source {\n\tmargin: 0;\n\tfloat: left;\n\tfont-weight: bold;\n\tfont-size: 0.75em;\n\tline-height: 1.5em;\n}\n.rg-source .pre-colon {\n\ttext-transform: uppercase;\n}\n.rg-credit {\n\tmargin: 0;\n\tcolor: #999;\n\ttext-transform: uppercase;\n\tletter-spacing: 0.05em;\n\tfloat: right;\n\ttext-align: right;\n\tfont-size: 0.65em;\n\tline-height: 1.5em;\n}\n/*styles for graphic*/\n.rg-map {\n\tmargin: 0;\n\twidth: 100%;\n\tfont-family: Helvetica, Arial, sans-serif;\n\tfont-size: 1em;\n\tborder-collapse: collapse;\n\tborder-spacing: 0;\n}\n.rg-map * {\n\t-moz-box-sizing: border-box;\n\tbox-sizing: border-box;\n\tmargin: 0;\n\tpadding: 0;\n\tborder: 0;\n\tfont-size: 100%;\n\tfont: inherit;\n\tvertical-align: baseline;\n\ttext-align: left;\n\tcolor: #333;\n}\n.rg-container.pull-map-right {\n\tfloat: right;\n\tmax-width: 320px;\n\twidth: 100%;\n\tmargin-left: 1em;\n}\n.rg-map-container {\n\twidth: 100%;\n\theight: 320px;\n\toverflow: hidden;\n}\n.leaflet-container p.rg-map-popup {\n\tpadding: 0 0.75em 0.5em 0.75em;\n\tmargin: 0;\n}\n.leaflet-container .leaflet-control-attribution {\n\tdisplay: none;\n}\n@media (max-width: 640px) {\n.rg-source-and-credit > div {\n\twidth: 100%;\n\tdisplay: block;\n\tfloat: none;\n\ttext-align: right;\n}\n.rg-container.pull-map-right {\n\tfloat: none;\n\tmax-width: 100%;\n\twidth: 100%;\n\tmargin-left: 0;\n}\n}</style>';

		_mapId = createId(_coords);

		var mapContent = '';
		mapContent += '<div class="rg-map">';
		mapContent += '<div class="rg-map-container" id="rg-map-' + _mapId + '"';
		mapContent += 'data-coords="' + _coords + '"';
		mapContent += 'data-popup="' + 'Enter text to go here in options below or leave blank to remove' + '"';
		mapContent += '>'
		mapContent += '</div>';
		mapContent += '</div>'
		mapContent += '<script src="' + _filepath + 'locator-map-' + _version + '.js" type="text/javascript"></script>';

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

		//update coords
		var finalCoords = getMarkerCoords();
		_mapId = createId(finalCoords);

		var html = '';

		var css = '/*styles for graphic info (hed, subhed, source, credit)*/\n.rg-container {\n\twidth: 100%;\n\tfont-family: Helvetica, Arial, sans-serif;\n\tfont-size: 16px;\n\tline-height: 1;\n\tmargin: 1em 0;\n\tpadding: 0.75em 0 0 0;\n\tcolor: #1a1a1a;\n\tborder-top: 1px solid #ccc;\n\tclear: both;\n}\n.rg-header {\n\tmargin-bottom: 0.5em;\n}\n.rg-hed {\n\tfont-family: "Benton Sans Bold", Helvetica, Arial, sans-serif;\n\tfont-weight: bold;\n\tfont-size: 1.35em;\n}\n.rg-subhed {\n\tfont-size: 1em;\n\tline-height: 1.4em;\n}\n.rg-source-and-credit {\n\tfont-family: Georgia,"Times New Roman", Times,serif;\n\twidth: 100%;\n\toverflow: hidden;\n\tmargin-top: 1em;\n}\n.rg-source {\n\tmargin: 0;\n\tfloat: left;\n\tfont-weight: bold;\n\tfont-size: 0.75em;\n\tline-height: 1.5em;\n}\n.rg-source .pre-colon {\n\ttext-transform: uppercase;\n}\n.rg-credit {\n\tmargin: 0;\n\tcolor: #999;\n\ttext-transform: uppercase;\n\tletter-spacing: 0.05em;\n\tfloat: right;\n\ttext-align: right;\n\tfont-size: 0.65em;\n\tline-height: 1.5em;\n}\n/*styles for graphic*/\n.rg-map {\n\tmargin: 0;\n\twidth: 100%;\n\tfont-family: Helvetica, Arial, sans-serif;\n\tfont-size: 1em;\n\tborder-collapse: collapse;\n\tborder-spacing: 0;\n}\n.rg-map * {\n\t-moz-box-sizing: border-box;\n\tbox-sizing: border-box;\n\tmargin: 0;\n\tpadding: 0;\n\tborder: 0;\n\tfont-size: 100%;\n\tfont: inherit;\n\tvertical-align: baseline;\n\ttext-align: left;\n\tcolor: #333;\n}\n.rg-container.pull-map-right {\n\tfloat: right;\n\tmax-width: 320px;\n\twidth: 100%;\n\tmargin-left: 1em;\n}\n.rg-map-container {\n\twidth: 100%;\n\theight: 320px;\n\toverflow: hidden;\n}\n.leaflet-container p.rg-map-popup {\n\tpadding: 0 0.75em 0.5em 0.75em;\n\tmargin: 0;\n}\n.leaflet-container .leaflet-control-attribution {\n\tdisplay: none;\n}\n@media (max-width: 640px) {\n.rg-source-and-credit > div {\n\twidth: 100%;\n\tdisplay: block;\n\tfloat: none;\n\ttext-align: right;\n}\n.rg-container.pull-map-right {\n\tfloat: none;\n\tmax-width: 100%;\n\twidth: 100%;\n\tmargin-left: 0;\n}\n}';

		html += '<style>' + css + '\n</style>';

		var classOption = _options.fullwidth ? '' : ' pull-map-right';

		html += '\n<div class="rg-container' + classOption + '">';
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
		html += ' data-coords="' + finalCoords + '" ';
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
		html += '\n<script src="http://apps.bostonglobe.com/common/js/locator-map/locator-map-' + _version + '.js" type="text/javascript"></script>';

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