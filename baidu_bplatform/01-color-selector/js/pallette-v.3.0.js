;(function(win){

function addEventHandler2(element, ev, handler){
  if(element.addEventListener){
    element.addEventListener(ev,handler,true);
  }else if(element.attachEvent){
    element.attachEvent("on" + ev, handler);
  }else{
    element["on" + ev] = handler;
  }
}

function createElement(eleType, opts){
	var c = document.createElement(eleType);
	if (typeof opts != "undefined"){
		for (var attr in opts){
		c.setAttribute(attr, opts[attr]);
		}
	}
	return c;
}

function bindNumberAndRange(numberInput, rangeInput){
	addEventHandler2(numberInput, "change", function(ev){
		rangeInput.value = numberInput.value;
	});
	addEventHandler2(numberInput, "input", function(ev){
		rangeInput.value = numberInput.value;
	});
	addEventHandler2(rangeInput, "change", function(ev){
		numberInput.value = rangeInput.value;
	});
	// addEventHandler2(rangeInput, "mousemove", function(ev){
	// 	//console.log("slider mousemove");
	// 	numberInput.value = rangeInput.value;
	// });
	addEventHandler2(rangeInput, "input", function(ev){
		numberInput.value = rangeInput.value;
	});
}


function getDeg(width,x,y){
	var x0, y0, r, radian;

	x0 = y0 = width / 2; 
	if(x == x0 && y == y0){
		return (NaN);
	}
	var r = Math.sqrt((x - x0)*(x - x0) + (y - y0)*(y - y0));
	radian = Math.acos( (x - x0)/r);
	if (y > y0){
		radian = (2*Math.PI - radian);
	}
	radian = (radian / (2*Math.PI) * 360);
	return radian;
}

/*
 *  convert HSV to RGB
 *	H ~ [0, 360]
 *	S ~ [0, 1]
 *	v ~ [0, 1]
 *	return [r,g,b] , where r,g,b is integer from 0 to 255
 */
function hsv2rgb(h,s,v){
	var r,g,b;
	if (isNaN(h)) {
		s = 0;
	}
	h %= 360;
	if (s == 0){
		r = g = b = v;
	}else{
		var i = Math.floor(h / 60) % 6;
		var f = h / 60 - i;
		var p = v * (1 - s);
		var q = v * (1 - f * s);
		var t = v * (1 - (1 - f) * s);
		if (i == 0)			{r = v; g = t; b = p;}
		else if (i == 1)	{r = q; g = v; b = p;}
		else if (i == 2)	{r = p; g = v; b = t;}
		else if (i == 3)	{r = p; g = q; b = v;}
		else if (i == 4)	{r = t; g = p; b = v;}
		else if (i == 5)	{r = v; g = p; b = q;}
	}	
	var R = Math.round(r*255);   //RGB results = From 0 to 255
	var G = Math.round(g*255);
	var B = Math.round(b*255);
	return new 	Array(R, G, B);
}

/*
 *  convert HSL to RGB
 *	H ~ [0, 360]
 *	S ~ [0, 1]
 *	v ~ [0, 1]
 *	return [r,g,b] , where r,g,b is integer from 0 to 255
 */
function hsl2rgb(h,s,l){
	var r,g,b;
	var p, q, hk, tr, tg, tb;
	function _c(t,p,q){
		if(t < 0) t += 1;
        if(t > 1) t -= 1;
		if (t < 1/6) return (p + ((q - p)*6*t));
		if (t < 0.5) return q;
		if (t < 2/3) return (p + ((q - p)*6*(2/3 - t)));
		return p;
	}
	if (isNaN(h)) {
		s = 0;
	}
	if (s == 0){
		r = g = b = l;
	}else{
		q = (l < 0.5) ? (l * (1 + s)): (l + s - l * s);
		p = 2 * l - q;
		hk = h / 360.0;
		r = _c(hk + 1/3, p, q);
		g = _c(hk, p, q);
		b = _c(hk - 1/3, p, q);
	}
	var R = Math.round(r*255);   //RGB results = From 0 to 255
	var G = Math.round(g*255);
	var B = Math.round(b*255);
	return new 	Array(R, G, B);
}
/**
 * convert rgb to hsv
 * r,g,b ~ [0,255]
 * return [h,s,v], H ~ [0, 360], S ~ [0, 1], v ~ [0, 1]
 * if r = g = b, h = 0, s = 0
 */
function rgb2hsv(r,g,b){
	var max, min, h, s, v, d;
	r /= 255.0;
	g /= 255.0;
	b /= 255.0;
	max = Math.max(r, g, b);
	min = Math.min(r, g, b);
	d = max - min;
	v = max;
	if ( max == 0)
		s = 0;
	else
		s = (max - min) /  max;
	if (d == 0) {
		h = 0; // undefined
	}else if (max == r) {
		h = 60 * ((((g - b) / d)+6) % 6);
	}else if (max == g) {
		h = 120 + 60 * (b - r) / d;
	}else {
		h = 240 + 60 * (r - g) / d;
	}
	return new Array(h,s,v);
}

/**
 * convert rgb to #XXXXXX;
 */
function rgb2str16(r,g,b){
	var rgbStr = "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
	return rgbStr;
}

/**************************************/
/**
 * param: pallette who owner this hsv component
 */
function HsvComponent(pallette){

	this.owner = pallette;
	this.init(this.owner.getHsvDiv());
}

HsvComponent.prototype.init = function(div){
	this.container = div;
	this.hsv_div = document.createElement("div");
  	this.hsv_div.innerHTML = "<img src='img/hsv-alpha-512.png' alt='' />";
  	this.hsv_div.className = "hsv-div";

  	this.target_div = document.createElement("div");
  	this.target_div.className = "target-div";
  	this.cover_div = document.createElement("div");
  	this.cover_div.className = "cover-div";

  	this.hsv_div.appendChild(this.target_div);
  	this.hsv_div.appendChild(this.cover_div);

  	this.container.appendChild(this.hsv_div);

  	var ownerPallette = this.owner;
  	addEventHandler2(this.cover_div, "click", function(ev){
  		var hsvCover = ev.target;
		var width = hsvCover.offsetWidth;
		var height = hsvCover.offsetHeight;
		var s = (ev.offsetX / width);
		var v = (ev.offsetY / height);
		//console.log(hDeg);
		//console.log("set hsv("+ ownerPallette.h+"," +s +"," +v +")");
		ownerPallette.setColorByHSV(ownerPallette.h, s, v);
  	});
}

HsvComponent.prototype.setBackgroundColor = function(colorStr){
	this.hsv_div.setAttribute("style", "background-color:"+colorStr+";");
}
HsvComponent.prototype.showColorByHSV = function(h,s,v){
	// we do not use h
	var coverWidth = this.cover_div.offsetWidth;
	var coverHeight = this.cover_div.offsetHeight;
	var targetWidth = this.target_div.offsetWidth;
	var targetHeight = this.target_div.offsetHeight;
	var rgbBG = hsv2rgb(h,1,1);
	var rgbStr = ("#" + ((1 << 24) + (rgbBG[0] << 16) + (rgbBG[1] << 8) + rgbBG[2]).toString(16).slice(1));
	this.hsv_div.style = "background-color:" + rgbStr +";" ;
						 
	this.target_div.style = ( "top:" + (coverHeight*v - targetHeight/2) + "px;" +
								  "left:"+ (coverWidth*s - targetWidth/2) + "px;" );
}
HsvComponent.prototype.showColorByRGB = function(r,g,b){
	// we do not use h
	var coverWidth = this.cover_div.offsetWidth;
	var coverHeight = this.cover_div.offsetHeight;
	var targetWidth = this.target_div.offsetWidth;
	var targetHeight = this.target_div.offsetHeight;
	var hsv = rgb2hsv(r,g,b);
	var rgbBG = hsv2rgb(hsv[0],1,1);
	var rgbStr = ("#" + ((1 << 24) + (rgbBG[0] << 16) + (rgbBG[1] << 8) + rgbBG[2]).toString(16).slice(1));
	this.hsv_div.style = "background-color:" + rgbStr +";" ;		 
	this.target_div.style = ( "top:" + (coverHeight*v - targetHeight/2) + "px;" +
								  "left:"+ (coverWidth*s - targetWidth/2) + "px;" );
}
/** HSV Component end **/


/**
 * Hue-O Component
 * param: pallette who owner this hsv component
 */
function HueOComponent(pallette){
	this.owner = pallette;
	this.init(this.owner.getHueDiv());
}
HueOComponent.prototype.init = function(div){
	this.container = div;
	this.hue_o_div = document.createElement("div");
	this.hue_o_div.innerHTML = "<img src='img/hue-o-512.png' alt='' />";
	this.hue_o_div.className = "hue-o-div"

	this.target_div = document.createElement("div");
  	this.target_div.className = "target-div";
  	this.cover_div = document.createElement("div");
  	this.cover_div.className = "cover-div";

  	this.hue_o_div.appendChild(this.target_div);
  	this.hue_o_div.appendChild(this.cover_div);

  	/** all **/
  	this.container.appendChild(this.hue_o_div);

  	var ownerPallette = this.owner;
  	var thisHueComponent = this;
  	addEventHandler2(this.cover_div, "click", function(ev){
  		var hueCover = ev.target;
		var width = hueCover.offsetWidth;
		var maxR, x0, y0;
		var x = ev.offsetX;
		var y = ev.offsetY;
		maxR = x0 = y0 = (width / 2);
		var r = Math.sqrt((x - x0)*(x - x0) + (y - y0)*(y - y0));
		var hsv,rgb,hDeg;
		hDeg = getDeg(width, x, y);
		if (r > maxR){
			hsv = [NaN, 1, ownerPallette.v];
			rgb = [255*ownerPallette.v, 255*ownerPallette.v, 255*ownerPallette.v];
		}else{
			var hDeg = getDeg(width, x, y);
			hsv = [hDeg, r/maxR, ownerPallette.v];
			rgb = hsv2rgb(hDeg, r/maxR, ownerPallette.v);
		}
		//console.log("set hsv("+ hsv[0]+"," + hsv[1] +"," + hsv[2] +")");
		ownerPallette.setColorByHSV(hsv[0], hsv[1], hsv[2]);
  	});
}
HueOComponent.prototype.showColorByHSV = function(h,s,v){
	// we do not use v
	var hue_o_div_H = this.hue_o_div.offsetHeight;
	var target_H = this.target_div.offsetHeight;
	var hue_o_div_W = this.hue_o_div.offsetWidth;
	var target_W = this.target_div.offsetWidth;
	var r = hue_o_div_W /2;
	var x0, y0, dx, dy;
	if ( s == 0 ){
		dy = dx = 0;
	}else{
		dy = Math.sin(h/180*Math.PI)*r*s;
		dx = Math.cos(h/180*Math.PI)*r*s;
	}
	//console.log(dx+","+dy);
	x0 = y0 = hue_o_div_W/2;
	this.target_div.style = ( "top:" + ((y0-dy) - target_H/2) + "px;" +
								  "left:"+ ((x0+dx) - target_W/2) + "px;" );
}
/* hue-o Component end */

/**
 * ctrl Component
 * param: pallette who owner this hsv component
 */
function CtrlComponent(pallette){
	this.owner = pallette;
	this.init(this.owner.getCtrlDiv());
}

CtrlComponent.prototype.init = function(div){
	this.container = div;
	//this.ctrl_div = document.createElement("div");

	/** input - rgb hsv - number and range **/
	this.h_value_number = createElement("input",  { "type": "number",
  													"min": "0",		"max": "360",
  													"step": "1",	"value": this.currentH } );
  	this.s_value_number = createElement("input",  { "type": "number",
  													"min": "0",		"max": "1",
  													"step": "0.01",	"value": this.currentS} );
  	this.v_value_number = createElement("input",  { "type": "number",
  													"min": "0",		"max": "1",
  													"step": "0.01", "value": this.currentV } );
  	this.h_value_slider = createElement("input",  { "type": "range",
  													"min": "0",		"max": "360",
  													"step": "1", 	"value": this.currentH } );
  	this.s_value_slider =  createElement("input",  { "type": "range",
  													"min": "0", 	"max": "1",
  													"step": "0.01", "value": this.currentS } );
  	this.v_value_slider = createElement("input",  { "type": "range",
  													"min": "0", 	"max": "1",
  													"step": "0.01", "value": this.currentV } );
  	/* -------------------------- */
  	this.r_value_number = createElement("input",  { "type": "number",
  													"min": "0",		"max": "255",
  													"step": "1",	"value": this.currentR } );
  	this.g_value_number = createElement("input",  { "type": "number",
  													"min": "0",		"max": "255",
  													"step": "1",	"value": this.currentG } );
  	this.b_value_number = createElement("input",  { "type": "number",
  													"min": "0",		"max": "255",
  													"step": "1", "value": this.currentB } );
  	this.r_value_slider = createElement("input",  { "type": "range",
  													"min": "0",		"max": "255",
  													"step": "1", 	"value": this.currentR } );
  	this.g_value_slider =  createElement("input",  { "type": "range",
  													"min": "0", 	"max": "255",
  													"step": "1", "value": this.currentG } );
  	this.b_value_slider = createElement("input",  { "type": "range",
  													"min": "0", 	"max": "255",
  													"step": "1", "value": this.currentB } );

  	var p_h = document.createElement("p")
  	var span_h = document.createElement("span");
  	span_h.innerHTML = "H:";
  	p_h.appendChild(span_h);
  	p_h.appendChild(this.h_value_number);
  	p_h.appendChild(this.h_value_slider);

  	var p_s = document.createElement("p")
  	var span_s = document.createElement("span");
  	span_s.innerHTML = "S:";
  	p_s.appendChild(span_s);
  	p_s.appendChild(this.s_value_number);
  	p_s.appendChild(this.s_value_slider);

  	var p_v = document.createElement("p")
  	var span_v = document.createElement("span");
  	span_v.innerHTML = "V:";
  	p_v.appendChild(span_v);
  	p_v.appendChild(this.v_value_number);
  	p_v.appendChild(this.v_value_slider);
  	//////////
  	var p_r = document.createElement("p")
  	var span_r = document.createElement("span");
  	span_r.innerHTML = "R:";
  	p_r.appendChild(span_r);
  	p_r.appendChild(this.r_value_number);
  	p_r.appendChild(this.r_value_slider);

  	var p_g = document.createElement("p")
  	var span_g = document.createElement("span");
  	span_g.innerHTML = "G:";
  	p_g.appendChild(span_g);
  	p_g.appendChild(this.g_value_number);
  	p_g.appendChild(this.g_value_slider);

  	var p_b = document.createElement("p")
  	var span_b = document.createElement("span");
  	span_b.innerHTML = "B:";
  	p_b.appendChild(span_b);
  	p_b.appendChild(this.b_value_number);
  	p_b.appendChild(this.b_value_slider);
	//////////

  	var fs = document.createElement("fieldset");
  	fs.className = "ctrl-div"
  	var lg = document.createElement("legend");
  	lg.innerHTML = "HSV &amp; RGB"
  	fs.appendChild(lg);

  	fs.appendChild(p_h);
  	fs.appendChild(p_s);
  	fs.appendChild(p_v);
  	fs.appendChild(p_r);
  	fs.appendChild(p_g);
  	fs.appendChild(p_b);

  	this.container.appendChild(fs);

  	// 因为取值是以number里的为准的，所以要绑定一下
  	// bindNumberAndRange(this.h_value_number, this.h_value_slider);
  	// bindNumberAndRange(this.v_value_number, this.v_value_slider);
  	// bindNumberAndRange(this.s_value_number, this.s_value_slider);
  	// bindNumberAndRange(this.r_value_number, this.r_value_slider);
  	// bindNumberAndRange(this.g_value_number, this.g_value_slider);
  	// bindNumberAndRange(this.b_value_number, this.b_value_slider);

  	var ownerPallette = this.owner;
  	var h_value_number = this.h_value_number;
  	var s_value_number = this.s_value_number;
  	var v_value_number = this.v_value_number;
  	var r_value_number = this.r_value_number;
  	var g_value_number = this.g_value_number;
  	var b_value_number = this.b_value_number;

  	var h_value_slider = this.h_value_slider;
  	var s_value_slider = this.s_value_slider;
  	var v_value_slider = this.v_value_slider;
  	var r_value_slider = this.r_value_slider;
  	var g_value_slider = this.g_value_slider;
  	var b_value_slider = this.b_value_slider;
  	function onHSVRangeChange(ev){
		var h = h_value_slider.value;
		var s = s_value_slider.value;
		var v = v_value_slider.value;
		// var rgb = hsv2rgb(h,s,v);
		// r_value_number.value = r_value_slider.value = rgb[0];
		// g_value_number.value = g_value_slider.value = rgb[1];
		// b_value_number.value = b_value_slider.value = rgb[2];
		if (isNaN(h)){
			ownerPallette.setColorByHSV(h,parseFloat(s),parseFloat(v));
		}else {
			ownerPallette.setColorByHSV(parseFloat(h),parseFloat(s),parseFloat(v));
		}
  	}
  	function onHSVNumberChange(ev){
		var h = h_value_number.value;
		var s = s_value_number.value;
		var v = v_value_number.value;
		// var rgb = hsv2rgb(h,s,v);
		// r_value_number.value = r_value_slider.value = rgb[0];
		// g_value_number.value = g_value_slider.value = rgb[1];
		// b_value_number.value = b_value_slider.value = rgb[2];
		if (isNaN(h)){
			ownerPallette.setColorByHSV(h,parseFloat(s),parseFloat(v));
		}else {
			ownerPallette.setColorByHSV(parseFloat(h),parseFloat(s),parseFloat(v));
		}
  	}
  	function onRGBRangeChange(ev){
  		var r = r_value_slider.value;
		var g = g_value_slider.value;
		var b = b_value_slider.value;

		ownerPallette.setColorByRGB(r,g,b);
  	}
  	function onRGBNumberChange(ev){
  		var r = r_value_number.value;
		var g = g_value_number.value;
		var b = b_value_number.value;
		// var hsv = hsv2rgb(r,g,b);
		// h_value_number.value = h_value_slider.value = hsv[0];
		// s_value_number.value = s_value_slider.value = hsv[1];
		// v_value_number.value = v_value_slider.value = hsv[2];
		console.log("onRGBNumberChange(" + r +"," + g + "," + b +")");
		ownerPallette.setColorByRGB(r,g,b);
  	}

  	addEventHandler2(this.h_value_number, "change", onHSVNumberChange);
  	addEventHandler2(this.s_value_number, "change", onHSVNumberChange);
  	addEventHandler2(this.v_value_number, "change", onHSVNumberChange);
  	addEventHandler2(this.h_value_slider, "change", onHSVRangeChange);
  	addEventHandler2(this.s_value_slider, "change", onHSVRangeChange);
  	addEventHandler2(this.v_value_slider, "change", onHSVRangeChange);
  	addEventHandler2(this.h_value_number, "input", onHSVNumberChange);
  	addEventHandler2(this.s_value_number, "input", onHSVNumberChange);
  	addEventHandler2(this.v_value_number, "input", onHSVNumberChange);
  	addEventHandler2(this.h_value_slider, "input", onHSVRangeChange);
  	addEventHandler2(this.s_value_slider, "input", onHSVRangeChange);
  	addEventHandler2(this.v_value_slider, "input", onHSVRangeChange);

  	addEventHandler2(this.r_value_number, "change", onRGBNumberChange);
  	addEventHandler2(this.g_value_number, "change", onRGBNumberChange);
  	addEventHandler2(this.b_value_number, "change", onRGBNumberChange);
  	addEventHandler2(this.r_value_slider, "change", onRGBRangeChange);
  	addEventHandler2(this.g_value_slider, "change", onRGBRangeChange);
  	addEventHandler2(this.b_value_slider, "change", onRGBRangeChange);
  	addEventHandler2(this.r_value_number, "input", onRGBNumberChange);
  	addEventHandler2(this.g_value_number, "input", onRGBNumberChange);
  	addEventHandler2(this.b_value_number, "input", onRGBNumberChange);
  	addEventHandler2(this.r_value_slider, "input", onRGBRangeChange);
  	addEventHandler2(this.g_value_slider, "input", onRGBRangeChange);
  	addEventHandler2(this.b_value_slider, "input", onRGBRangeChange);
}

CtrlComponent.prototype.showColorByHSV = function (h,s,v){
	if (s == 0){
		//h = NaN;
		//this.h_value_number.value = this.h_value_slider.value = null;
	}else if ( isNaN(h)){
		//this.h_value_number.value = this.h_value_slider.value = null;
	}else{
		this.h_value_number.value = this.h_value_slider.value = parseFloat(h).toFixed(2);
	}
	
	this.s_value_number.value = this.s_value_slider.value = parseFloat(s).toFixed(2);
  	this.v_value_number.value = this.v_value_slider.value = parseFloat(v).toFixed(2);
  	var rgb = hsv2rgb(h,s,v);
  	this.r_value_number.value = this.r_value_slider.value = rgb[0];
  	this.g_value_number.value = this.g_value_slider.value = rgb[1];
  	this.b_value_number.value = this.b_value_slider.value = rgb[2];
}
/* ctrl componoet end */

/* Interface component */
function InterfaceComponent(pallette){
	this.owner = pallette;
	this.init(this.owner.getInterfaceDiv());
}
InterfaceComponent.prototype.init = function(div){
	this.container = div;
	this.hsvStr = createElement("input",  { "type": "text", "class":"interface-txt"} );
	this.rgbStr = createElement("input",  { "type": "text", "class":"interface-txt"} );
	this.cssStr = createElement("input",  { "type": "text", "class":"interface-txt"} );
	this.colorDiv = createElement("div", {"class":"interface-color"});

	var fs = document.createElement("fieldset");
  	fs.className = "interface-div"
  	var lg = document.createElement("legend");
  	lg.innerHTML = "Interface"
  	fs.appendChild(lg);

  	var pHsv = document.createElement("p")
  	var spanHsv = document.createElement("span");
  	spanHsv.innerHTML = "HSV:";
  	pHsv.appendChild(spanHsv);
  	pHsv.appendChild(this.hsvStr);

  	var pRgb = document.createElement("p")
  	var spanRgb = document.createElement("span");
  	spanRgb.innerHTML = "RGB:";
  	pRgb.appendChild(spanRgb);
  	pRgb.appendChild(this.rgbStr);

  	var pCss = document.createElement("p")
  	var spanCss = document.createElement("span");
  	spanCss.innerHTML = "CSS:";
  	pCss.appendChild(spanCss);
  	pCss.appendChild(this.cssStr);

  	var pDiv = document.createElement("p");
  	var spanDiv = document.createElement("span");
  	spanDiv.innerHTML = "Color:";
  	pDiv.appendChild(spanDiv);
  	pDiv.appendChild(this.colorDiv);

  	fs.appendChild(pHsv);
  	fs.appendChild(pRgb);
  	fs.appendChild(pCss);
  	fs.appendChild(pDiv);

  	this.container.appendChild(fs);
}
InterfaceComponent.prototype.showColorByHSV = function(h,s,v){
	var rgb = hsv2rgb(h,s,v);
	h = isNaN(h) ? "NaN" : (parseFloat(h).toFixed(2));
	var hsvStr = "hsv("+ h+", " + s.toFixed(2) +", " + v.toFixed(2) +")";
	var rgbStr = "rgb("+ rgb[0]+", " + rgb[1] +", " + rgb[2] +")";
	var cssStr = rgb2str16(rgb[0],rgb[1],rgb[2]);
	this.rgbStr.value = rgbStr;
	this.hsvStr.value = hsvStr;
	this.cssStr.value = cssStr;
	this.colorDiv.style = "background-color:"+cssStr+";";
}
/* interface component end */




function Pallette(opts){
	this.h =  (typeof opts.h) == 'number' ? opts.h : 0;
	this.s =  (typeof opts.s) == 'number' ? opts.s : 0.5;
	this.v =  (typeof opts.v) == 'number' ? opts.v : 0.5;
	this.init(opts);
	//this.setColorByHSV(this.h,this.s,this.v);
}

Pallette.prototype.getHsvDiv = function(){
	return this.hsv_div;
}

Pallette.prototype.getHueDiv = function(){
	return this.hue_div;
}

Pallette.prototype.getCtrlDiv = function(){
	return this.ctrl_div;
}

Pallette.prototype.getInterfaceDiv = function(){
	return this.interface_div;
}

Pallette.prototype.init = function(opts){
	this.hsv_div = document.createElement("div");
	this.hue_div = document.createElement("div");
	this.ctrl_div = document.createElement("div");
	this.interface_div = document.createElement("div");

	this.hueComponent = new HueOComponent(this);
	this.hsvComponent = new HsvComponent(this);
	this.ctrlComponent = new CtrlComponent(this); 
	this.interfaceComponent = new InterfaceComponent(this); 

	var div = document.createElement("div");
	div.className="color-selector-content";

	div.appendChild(this.hsv_div);
	div.appendChild(this.hue_div);
	div.appendChild(this.ctrl_div);
	div.appendChild(this.interface_div);

	opts.container.appendChild(div);
}

Pallette.prototype.setColorByHSV = function (h, s, v){
	if (isNaN(h)){
		s = 0;
	}else{
		s = (s < 0 ? (0) : (s > 1 ? 1: s) );
	}
	
	v = (v < 0 ? (0) : (v > 1 ? 1: v) );
	this.h = h;
	this.s = s;
	this.v = v;
	//this.hsvComponent.setBackgroundColor(h,s,v);
	this.hsvComponent.showColorByHSV(h,s,v);
	this.hueComponent.showColorByHSV(h,s,v);
	this.ctrlComponent.showColorByHSV(h,s,v);
	this.interfaceComponent.showColorByHSV(h,s,v);
}

Pallette.prototype.setColorByRGB = function (r,g,b){
	var hsv = rgb2hsv(r,g,b);
	this.setColorByHSV(hsv[0], hsv[1], hsv[2]);
}

Pallette.prototype.getRgbColor = function (){
	var rgb = hsv2rgb(this.h, this.s, this.v);
	return rgb;
}

Pallette.prototype.getHsvColor = function (){
	return new Array(this.h, this.s, this.v);
}
Pallette.prototype.getCssColor = function (){
	var rgb = hsv2rgb(this.h, this.s, this.v);
	return rgb2str16(rgb[0], rgb[1], rgb[2]);
}


	//-- 对外可使用的原型 --//
  	if (typeof win.Pallette === 'undefined') {
    	win.Pallette = function (opts){
      		return new Pallette(opts);
    	}
  	}
})(window);

