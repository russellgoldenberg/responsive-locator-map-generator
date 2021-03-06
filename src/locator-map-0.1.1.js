var setupMap = function() {
	var _token = 'pk.eyJ1IjoiZ2FicmllbC1mbG9yaXQiLCJhIjoiVldqX21RVSJ9.Udl7GDHMsMh8EcMpxIr2gA';
	var _rgMapContainers = document.getElementsByClassName('rg-map-container');
	var _dev = { mode: false, map: null, marker: null };

	//some assists for development
	var hostname = window.location.hostname;
	if(hostname === 'russellgoldenberg.github.io' || hostname === 'localhost') {
		_dev.mode = true;
	}

	if(_rgMapContainers.length) {
		for(var i = 0; i < _rgMapContainers.length; i++) {
			var el = _rgMapContainers[i];
			var id = el.id;
			var coords = splitCoords(el.dataset.coords);
			var zoom = el.dataset.zoom || 11;
			var popup = el.dataset.popup || false;
			var icon = el.dataset.icon || false;
			var loaded = el.dataset.loaded || false;
			var controls = el.dataset.controls || _dev.mode;

			if(!loaded) {
				el.dataset.loaded = 'loaded';
				L.mapbox.accessToken = _token;
				var latlng = L.latLng([coords.lat, coords.lng]);

				var map = L.mapbox.map(id, 'gabriel-florit.li1b7gf6', {
					'center': latlng,
					'zoom': zoom,
					'attributionControl': false,
					'tap': false,
					'touchZoom': false,
					'scrollWheelZoom': false,
					'zoomControl': controls,
					'doubleClickZoom': controls,
					'dragging': controls
				});

				_dev.map = map;

				var iconOptions = {
	        		'marker-size': 'large',
	        		'marker-color': '#59889d'
				};

				if(icon) {
					iconOptions['marker-symbol'] = icon;
				}

				var marker = L.marker(latlng, { draggable: _dev.mode , icon: L.mapbox.marker.icon(iconOptions) });
				_dev.marker = marker;

				marker.addTo(map);

				if(popup) {
					var content = '<p class="rg-map-popup">' + popup + '</p>';
					marker.bindPopup(content);
				}
			}
		}
	}

	if(_dev.mode) {
		window.getMapZoomLevel = function() {
			return _dev.map.getZoom();
		}
		window.getMarkerCoords = function() {
			var coords = _dev.marker.getLatLng();
			return coords.lat + ',' + coords.lng;
		}
	}
};

var splitCoords = function(input) {
	var split = input.split(',');
	return { lat: split[0].trim(), lng: split[1].trim() }
};

var init = function() {
	if(!window.rgMapboxLoaded) {
		window.rgMapboxLoaded = true;
		loadCSS('https://api.tiles.mapbox.com/mapbox.js/v2.1.9/mapbox.css');
		loadJS('https://api.tiles.mapbox.com/mapbox.js/v2.1.9/mapbox.js', setupMap);
	}
};

/*! loadJS: load a JS file asynchronously. [c]2014 @scottjehl, Filament Group, Inc. (Based on http://goo.gl/REQGQ by Paul Irish). Licensed MIT */
function loadJS( src, cb ){
	"use strict";
	var ref = window.document.getElementsByTagName( "script" )[ 0 ];
	var script = window.document.createElement( "script" );
	script.src = src;
	script.async = true;
	ref.parentNode.insertBefore( script, ref );
	if (cb && typeof(cb) === "function") {
		script.onload = cb;
	}
	return script;
}

/* exported loadCSS */
function loadCSS( href, before, media, callback ){
	"use strict";
	// Arguments explained:
	// `href` is the URL for your CSS file.
	// `before` optionally defines the element we'll use as a reference for injecting our <link>
	// By default, `before` uses the first <script> element in the page.
	// However, since the order in which stylesheets are referenced matters, you might need a more specific location in your document.
	// If so, pass a different reference element to the `before` argument and it'll insert before that instead
	// note: `insertBefore` is used instead of `appendChild`, for safety re: http://www.paulirish.com/2011/surefire-dom-element-insertion/
	var ss = window.document.createElement( "link" );
	var ref = before || window.document.getElementsByTagName( "script" )[ 0 ];
	var sheets = window.document.styleSheets;
	ss.rel = "stylesheet";
	ss.href = href;
	// temporarily, set media to something non-matching to ensure it'll fetch without blocking render
	ss.media = "only x";
	// DEPRECATED
	if( callback ) {
		ss.onload = callback;
	}

	// inject link
	ref.parentNode.insertBefore( ss, ref );
	// This function sets the link's media back to `all` so that the stylesheet applies once it loads
	// It is designed to poll until document.styleSheets includes the new sheet.
	ss.onloadcssdefined = function( cb ){
		var defined;
		for( var i = 0; i < sheets.length; i++ ){
			if( sheets[ i ].href && sheets[ i ].href.indexOf( href ) > -1 ){
				defined = true;
			}
		}
		if( defined ){
			cb();
		} else {
			setTimeout(function() {
				ss.onloadcssdefined( cb );
			});
		}
	};
	ss.onloadcssdefined(function() {
		ss.media = media || "all";
	});
	return ss;
}


//kickoff
var hostname = window.location.hostname;
if(hostname.indexOf('bostonglobe.com') > -1 || hostname === 'localhost' || hostname === 'russellgoldenberg.github.io') {
	init();
} else {
	console.log('do not use this outside of boston globe');
}