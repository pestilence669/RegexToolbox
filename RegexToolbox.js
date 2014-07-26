/*******************************************************************************

   RegexToolbox (Widget) for Apple Dashboard
   Regular Expression Evaluator & Testing Tool

   Release: 1.0
   Author:  Paul Chandler <regextoolbox@mac.com>
   Date:    August 10th, 2005

*******************************************************************************/

// HELPER FUNCTIONS //

function string_trim(s) {
  s = this != window ? this : s;
  return s.replace(/^\s+/g, '').replace(/s+$/g, '');
}

String.prototype.trim = string_trim;

function pad(n) {
  var o = n.toString();
  while (o.length < 3) o = '0' + o;
  return o;
}

function exto(url) {
  if (widget) widget.openURL(unescape(url));
  else window.open(url);
}

function ixl(a) {
  if (a && a.length) document.forms.primary.re.value = a;
  recalc();
}

function isl(a) {
  if (a && a.length) document.forms.primary.sa.value = a;
  recalc();
}

// WIDGET SUPPORT //

function onhide() {
  savePrefs();
}

function onshow() {}

function setup() {

  if (window.widget) {
    var re = widget.preferenceForKey('re');
    var sa = widget.preferenceForKey('sa');

    ixl(re); isl(sa);
  } else recalc(); // safari mode

}

function savePrefs() {

  if (window.widget) with (document.forms.primary) {
    widget.setPreferenceForKey(re.value, 're');
    widget.setPreferenceForKey(sa.value, 'sa');
  }

}

function showPrefs() {
  if (flipped) return;
  var front = document.getElementById("front");
  var back = document.getElementById("back");

  if (window.widget) widget.prepareForTransition("ToBack");

  front.style.display="none";
  back.style.display="block";

  if (window.widget) setTimeout ('widget.performTransition();', 0);
  document.getElementById('fliprollie').style.display = 'none';

  flipped = true;
}

function hidePrefs() {
  if (!flipped) return;
  var front = document.getElementById("front");
  var back = document.getElementById("back");

  if (window.widget) widget.prepareForTransition("ToFront");

  back.style.display="none";
  front.style.display="block";

  if (window.widget) setTimeout ('widget.performTransition();', 0);

  flipped = false;
}

function mousemove (event) {
  if (!flipShown) {
    if (animation.timer != null) {
      clearInterval (animation.timer);
      animation.timer  = null;
    } 

  var starttime = (new Date).getTime() - 13;

  animation.duration = 500;
  animation.starttime = starttime;
  animation.firstElement = document.getElementById ('flip');
  animation.timer = setInterval ("animate();", 13);
  animation.from = animation.now;
  animation.to = 1.0;
  animate();
  flipShown = true;
  }
}

function mouseexit (event) {
  if (flipShown) {
    if (animation.timer != null) {
      clearInterval (animation.timer);
      animation.timer  = null;
    }

    var starttime = (new Date).getTime() - 13;

    animation.duration = 500;
    animation.starttime = starttime;
    animation.firstElement = document.getElementById ('flip');
    animation.timer = setInterval ("animate();", 13);
    animation.from = animation.now;
    animation.to = 0.0;
    animate();
    flipShown = false;
  }
}

function animate() {
  var T;
  var ease;
  var time = (new Date).getTime();

  T = limit_3(time-animation.starttime, 0, animation.duration);

  if (T >= animation.duration) {
    clearInterval (animation.timer);
    animation.timer = null;
    animation.now = animation.to;
  } else {
    ease = 0.5 - (0.5 * Math.cos(Math.PI * T / animation.duration));
    animation.now = computeNextFloat (animation.from, animation.to, ease);
  }

  animation.firstElement.style.opacity = animation.now;
}

function limit_3 (a, b, c) { return a < b ? b : (a > c ? c : a); }
function computeNextFloat (from, to, ease) { return from + (to - from) * ease; }
function enterflip(event) { document.getElementById('fliprollie').style.display = 'block'; }
function exitflip(event) { document.getElementById('fliprollie').style.display = 'none'; }

// PLAIN CODE

var animation = {duration:0, starttime:0, to:1.0, now:0.0, from:0.0, firstElement:null, timer:null};
var flipShown = false;
var flipped   = false;

if (window.widget) {
  widget.onhide = onhide;
  widget.onshow = onshow;
}

// REGEXTOOLBOX FUNCTIONS //

function cheat() {
  var c = document.getElementById('cheat').style;
  c.display = c.display == 'block' ? 'none' : 'block';
}

function donate() {
  exto('https://www.paypal.com/cgi-bin/webscr?cmd=_xclick&business=regextoolbox%40mac%2ecom&item_name=RegexToolbox&amount=2%2e00&no_shipping=1&no_note=1&tax=0&currency_code=USD&bn=PP%2dDonationsBF&charset=UTF%2d8');
}

function setResults(value) {
  var obj = document.getElementById('results');
  obj.innerHTML = value.replace(/\n/g, '<br />');
}


function recalc() {

  with (document.forms.primary) {
    re.value = re.value.replace(/\n/g, ''); // filter newlines (textarea)
    var re = re.value.trim();
    var sa = sa.value;
  }

  var regex_parse = /^([s|m])(.)/;
  if (!regex_parse.test(re)) return bail('Create a text substitution or match expression<br />"s/" or "m/"');
  var elements    = re.match(regex_parse);

  if (elements.length > 1) {
    var separator = elements[2];
    elements      = re.split(separator);
    var rxtype    = elements[0];
    var expr      = elements[1];

    switch (rxtype) {
      case 's': // text substitution
        if (!expr.length) return bail('Specify the expression to match for replacement');

	var rtext = elements[2] ? elements[2] : '';
	var ropts = elements[3];
	var rx    = new RegExp(expr, 'm' + ropts);
        
	setResults(sa.replace(rx, rtext).replace(/ /g, '&nbsp;'));
        break;
      case 'm': // text matching
        if (!expr.length) return bail('Specify the expression to match on');

	var ropts = elements[2];
	var rx    = new RegExp(expr, ropts);

	var samples = sa.split(/\n/g);
	var output  = '';

        for (var j = 0; j < samples.length; j++) {

	  var matches   = samples[j].match(rx);

	  var suboutput = [];

	  if (matches) for (var i = 0; i < matches.length; i++) {
	    suboutput.push( i + ':' + matches[i] );
  	  }
	  suboutput = suboutput.join(', ');
	  suboutput = suboutput ? ' <b>(' + suboutput + ')</b>' : suboutput;

	  output += '<b>' + pad(j + 1) + ':</b> ' +  samples[j].replace(/\s/g, '&nbsp;') + suboutput + "\n";
	}
        
	setResults(output);
        break;
      default:
        return bail('Unknown regular expression type');

        break;
    }

  } else return bail('Invalid regular expression');

}

function bail(msg) {
  setResults(msg); return false;
}
