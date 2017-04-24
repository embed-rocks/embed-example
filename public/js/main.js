require('whatwg-fetch');
var linkify = require('linkify-it')();
var Card = require('./Card');

function App() {
	this.link = document.getElementById('link');
	this.container = document.getElementById('card-container');
	this.link.addEventListener('input', this.getpreview.bind(this));
}

App.prototype.setresult = function(err, json) {
	console.log(err, json);
	if (json) {
		this.card = new Card(json);
		console.log(this.card.render());
		this.container.innerHTML = this.card.render();
	}
}

App.prototype.getpreview = function() {
	var m, matches, self, text, url, urls;

	self = this;
	text = this.link.value;

	if (typeof text === 'undefined') {
		return;
	}

	matches = linkify.match(text) || [];

	urls = (function() {
		var i, len, results;
		results = [];
		for (i = 0, len = matches.length; i < len; i++) {
			m = matches[i];
			results.push(m != null ? m.url : void 0);
		}
		return results;
	})();

	if (urls.length) {
		url = urls[0];

		return window.fetch("/api?url=" + (encodeURIComponent(url))).then(function(response) {
			return response.json();
		}).then(function(json) {
			return self.setresult(null, json);
		})["catch"](function(ex) {
			return self.setresult(ex, null);
		});
	}
}

App.prototype.play = function() {
	var el = document.createElement('div');
	var self = this;
	el.id = 'video-player-wrapper';
	el.innerHTML = this.card.play();

	// calculate proper dimensions if there is an iframe
	var iframe = el.querySelector('iframe');
	if (iframe) {
		this.fn = function() { self.setOptimalSize(iframe); }
		this.fn();
		window.addEventListener('resize', this.fn);
	}

	document.body.appendChild(el);
};

App.prototype.stop = function(e) {
	if (e) e.stopPropagation();
	var o = document.getElementById('video-player-wrapper');
	if (o && o.parentNode) {
		o.parentNode.removeChild(o);	
	}

	window.removeEventListener('resize', this.fn);
};

// Calculate optimal dimensions so that the longer side
// is 90% (of the screen) and the shorter side is based
// on the aspect ratio of the original image/iframe.
App.prototype.setOptimalSize = function(el) {
	var item = this.card.item;

	function calculateOptimalDimensions(video, options) {
		var w, h,
			screenw = Math.max(document.documentElement.clientWidth, window.innerWidth || 0),
			screenh = Math.max(document.documentElement.clientHeight, window.innerHeight || 0),
			width = video.width && parseInt(video.width, 10),
			height = video.height && parseInt(video.height, 10);
		
		// expand (video) size to the maxwidth/maxheight
		// some sites want to have a fixed height video/swf, so take that into account
		if (width && height) {
			if (width > height && screenw > screenh) {
				// first calculate the maximum width we can use, i.e. 
				// if the aspect ratio of the screen is wider than the iframe
				var wmax = (width / height) * screenh;

				// 0.9 is because the width of the iframe is 90 % of the screen
				w = 0.9 * wmax;
				h = w / (width / height);
			}
			else {
				// first calculate the maximum height we can use, i.e. 
				var hmax = screenw / (width / height);

				h = 0.9 * hmax;
				w = hmax * (width / height);
			}

			return { w: w + 'px', h: h + 'px' };
		}
	}
	if (item.videos && item.videos[0]) {
		var v = item.videos[0];
		var size = calculateOptimalDimensions(v, { fixedHeight: v.fixedHeight });

		if (size) {
			el.style.width = size.w;
			el.style.height = size.h;
		}
	}
}


var app = window.app = new App();
