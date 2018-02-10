// 
// The reference/example implementation of a card template for Embed.rocks.
// 
// Copyright (C) Embed.rocks.
// 
// License: MIT 
// 
// Usage: 
//  var Card = require('./card');
//  var card = Card(item);
//  var rendered = card.render();
// 


// set this if you want to use a domain to display images safely
// var defaults = { safe: '//safe.mydomain.com/' };
const defaults = { };

const COMBINED_MAX_LENGTH_FOR_SMALL_CARD = 180
const CARD_WIDTH = 600
const CARD_HEIGHT_SMALL = 125

const oembedSites = [
  'facebook.com',
  'twitter.com',
  'airtable.com',
  'mathembed.com',
  'soundcloud.com'
]


function Card(item, options) {
  if (!(this instanceof Card)){
    return new Card(item, options);
  }

  this.item = item;
  this.options = Object.assign(options || {}, defaults);
}

Card.prototype.render = function(small) {
  var res = '',
      item = this.item;

  this.small = small;

  if (item.images && item.images[0] && item.images[0].width < 150) {
    this.small = small = true;
  }

  if (item) {
    res += `<div class="card card-${item.type} ${small ? 'card-small' : 'card-big'} ${helpers.preferOembed(item, small) ? 'card-iframe': ''} ${helpers.isHtml5Video(item) ? 'card-html5-video' : ''}">`;

    if (item.type == 'error') {
      res += this.error(item);
    }

    else if (helpers.preferOembed(item, small)) {
      res += this.oembed(item);
    }

    else if (item.type == 'audio') {
      res += this.audio(item);
    }

    // If the type is photo, let's show only the photo and nothing else (no text, for example).
    else if (item.type == 'photo' && item.images && item.images.length) {
      res += this.image(item.images[0]);
    }

    // Same when the oembed type is photo.
    // Note that while we usually don't use the oembed type, the photo type is useful and safe.
    // 
    // Todo: we should check that this doesn't conflict with the regular embed, i.e. if there 
    // is something useful in the regular embed, we should use that. In practice though it probably won't conflict.
    else if (item.oembed && item.oembed.type == 'photo' && item.oembed.images && item.oembed.images.length) {
      res += this.image(item.oembed.images[0]);
    } 

    else if (item.type == 'audio') {
      res += this.audio(item);
    }

    else if (item.type == 'rich') {
      res += this.rich(item);
    }

    else if (item.type == 'video') {
      res += this.video(item);
    }

    res += `</div>`;
  }

  return res;
}

Card.prototype.error = function() {
  return `
    <p class="error">
      ${this.item.msg || (this.item.error && (this.item.error.code || this.item.error.errno)) }
    </p>
  `;
}

Card.prototype.rich = function() {
  return `
    <a target="_blank" href="${this.item.url}">
      ${this.item.images && this.item.images.length? this.image(this.item.images[0]): ''}
      ${this.text()}
    </a>
  `;  
}

Card.prototype.oembed = function() {
  return this.item.oembed.html;  
}

Card.prototype.video = function() {
  var item = this.item;

  if (item.images && item.images.length) {
    return `
      <span class="vplay" onClick="app.play()">
        ${this.image(item.images[0])}
        ${this.btn()}
      </span>
      <a target="_blank" href="${item.url}">
        ${this.text(item)}
      </a>
    `;
  }
  else if (helpers.isHtml5Video(item)) {
    return this.videoHtml5();
  }
  else {
    return this.videoIframe();
  }
}

Card.prototype.image = function(image) {
  if (this.options.safe && image.safe) {
    return `
      <img onerror="this.src='/img/broken.jpg'" onload="showImage(this)" class="card-image" src="${options.safe}${image.safe}" style="${helpers.dimensions(image, this.small)}">
    `;
  }
  else {
    return `
      <img onerror="this.src='/img/broken.jpg'" onload="showImage(this)" class="card-image" src="${image.url}" style="${helpers.dimensions(image, this.small)}">
    `;
  }
}

Card.prototype.videoHtml5 = function() {
  var item = this.item;

  return `
    <span class="vplay" onClick="app.play()">
      <video class="${this.options.big? 'big': ''}">
        <source type="${item.videos[0].type}" src="${item.videos[0].secureUrl || item.videos[0].url}">
      </video>
      ${this.btn()}
    </span>
    ${this.text()}
  `;
}

Card.prototype.videoIframe = function() {
  var item = this.item;

  return `
    <iframe src="${item.videos[0].secureUrl || item.videos[0].url}"></iframe>
    ${this.text()}
  `;
}

Card.prototype.videoHtml5Player = function() {
  var item = this.item;

  return `
    <video controls loop autoplay>
      <source type="${item.videos[0].type}" src="${item.videos[0].secureUrl || item.videos[0].url}">
    </video>
  `;
}

Card.prototype.text = function() {
  var item = this.item;
  var title = item.title? `<h3>${item.title}</h3>`: '';
  var author = item.author || item.published_date? `<p class="author">${item.author || ''} ${helpers.publishedDate(item.published_date)}</p>`: '';
  console.log(this, this.small);
  var description = item.description? (this.small? `<p>${this.descriptionForSmallCard()}</p>`: `<p>${item.description}</p>`): '';
  var favicon = '';

  if (item.favicon || item.site) {
    if (this.options.safe && item.favicon && item.favicon.safe) {
      favicon = `<p class="fav"><img onerror="this.src='/img/broken.jpg'" class="favicon" src="${this.options.safe}{item.favicon.safe}">{{/}}${item.site || ''}</p>`;
    }
    else if (item.favicon && item.favicon.url) {
      favicon = `<p class="fav"><img onerror="this.src='/img/broken.jpg'" class="favicon" src="${item.favicon.url}">${item.site || ''}</p>`;
    }
    else {
      favicon = `<p class="fav">${item.site || ''}</p>`;
    }
  }

  return `
    <div class="card-text">
      ${title}
      ${author}
      ${description}
      ${favicon}
    </div>
  `;
}

// If we are showing a small card, we need to trim the description a bit.
Card.prototype.descriptionForSmallCard = function() {
  var description, l, ref, ref1, item = this.item;
  if (item) {
    l = ((ref = item.title) != null ? ref.length : void 0) + ((ref1 = item.description) != null ? ref1.length : void 0) - COMBINED_MAX_LENGTH_FOR_SMALL_CARD;
    if (l > 0) {
      description = helpers.trim(item.description, item.description.length - l);
    }
    return description || item.description;
  } else {
    return '';
  }
}

Card.prototype.btn = function() {
  return `
    <span class="btn">
      <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60"><circle cx="25" cy="25" r="25" stroke-width="6" transform="translate(3 3)" stroke="#ffffff" fill="rgba(0, 0, 0, 0.3)"></circle><path d="M54,79V48L78,64Z" transform="translate(-34 -36)" stroke-width="0" stroke="#ffffff" fill="#ffffff"></path></svg>
    </span>
  `;
};

Card.prototype.play = function() {
  var item = this.item;

  return `
    <div onClick="app.stop(event)" class="dl-container" id="dl-container">
      ${helpers.isHtml5Video(item)? this.videoHtml5Player(): this.videoIframe()}
      <i onClick="app.stop(event)" class="viewer-close fa fa-times-circle"></i>
    </div>
  `
};

var helpers = {

  trim: (description, len) => {
    if (description.length > len) {
      description = description.substring(0, len);
      description = description.substring(0, description.lastIndexOf(' ')) + '...';
    }
    description = description.trim();
    return description;
  },

  preferOembed: (item, small) => {
    var item, ref, toRegExp;
    toRegExp = function(arr) {
      return new RegExp("^https?:\/\/(?:www\.)?" + arr.map(function(el) {
        return "(?:" + el + ")";
      }).join('|') + "$", 'i');
    };

    if (small) {
      return false;
    }

    return (item != null ? (ref = item.oembed) != null ? ref.type : void 0 : void 0) === 'rich' && (item != null ? item.url.match(toRegExp(oembedSites)) : void 0);
  },

  isHtml5Video: (item) => {
    return item &&
      item.type === 'video' &&
      item.videos &&
      item.videos[0] &&
      item.videos[0].type &&
      item.videos[0].type.substring(0, 5) === 'video'
      item.videos[0].type !== 'video/flash';
  },

  isIframeVideo: (item) => {
    return item &&
      item.type === 'video' &&
      item.videos &&
      item.videos[0] &&
      item.videos[0].type &&
      (item.videos[0].type === 'video/flash' || item.videos[0].type.substring(0, 5) !== 'video');
  },

  publishedDate: (date) => {
    if (date && date.parsed) {
      var d = Date.parse(date.parsed)
      if (d) {
        return new Date(d).toLocaleString()
      }    
    } 

    return ''
  },

  dimensions: function(image, small) {
    var h, small, w;
    
    if (small) {
      h = CARD_HEIGHT_SMALL;
      w = CARD_HEIGHT_SMALL * (image.width / image.height);
    } else {
      w = CARD_WIDTH;
      h = (CARD_WIDTH * image.height) / image.width;
    }

    return "width: " + w + "px; height: " + h + "px";
  }  
}