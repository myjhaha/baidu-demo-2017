var $ = function(eleId){
  return document.querySelector(eleId);
}
function addEventHandler(element, ev, handler){
  if(element.addEventListener){
    element.addEventListener(ev,handler,false);
  }else if(element.attachEvent){
    element.attachEvent("on" + ev, handler);
  }else{
    element["on" + ev] = handler;
  }
}


/****************************/
window.onload = function (ev){
	initPallette();
}

function addColorToList(div, colorStr){
	var colorDiv = document.createElement("div");
	colorDiv.style.setProperty("background-color",colorStr);
	colorDiv.className = "color-block";

	var txtDiv = document.createElement("div");
	txtDiv.innerHTML = colorStr;
	txtDiv.className = "txt-block";

	var itemDiv = document.createElement("div");
	itemDiv.appendChild(colorDiv);
	itemDiv.appendChild(txtDiv);
	itemDiv.className = "list-item";

	div.appendChild(itemDiv);
}

function initPallette(){
	var testDiv = $("#test-div-3");
	var pallete = new Pallette({ 
								container:testDiv, 
								h:NaN,
								s:0, 
								v:0.5 
							});
	pallete.setColorByHSV(120, 0.8, 0.7);

	optEventInit(pallete);
}

function optEventInit(pallete){
	var listDiv = $("#selected-color-list");
	var optBtn = $("#add_to_list_btn");
	addEventHandler(optBtn, "click", function(ev){

		var cssStr = pallete.getCssColor();
		console.log(cssStr);
		addColorToList(listDiv,cssStr);

	});
}