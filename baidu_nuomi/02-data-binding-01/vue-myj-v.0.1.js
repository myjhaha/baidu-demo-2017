
function Observer(data){
	this.data = data;
	//def(data, '__ob__', this);	//给一个指针指回去
	this.walk(data);
}

let p = Observer.prototype;

p.walk = function(obj){
	let val; 
	let _this = this;
	for (let key in obj) {
		if (obj.hasOwnProperty(key)){
			val = obj[key];
			_this.makeSetterAndgetter(key, val);
			if (typeof val === 'object') {
				new Observer(val);
			}
		}
	}
}

p.makeSetterAndgetter = function (key, val){
	let _this = this;
	Object.defineProperty(_this.data, key, {
		configurable:true,
		enumerable: true,
		get :function() {
			console.log("你访问了属性 " + key);
			return val;
		},
		set :function (newVal) {
			console.log("你设置了 "+key+", 新的值为 "+newVal);
			if (newVal === val) return;
			if (typeof newVal === 'object') {
				new Observer(newVal);
			}
            val = newVal;
		}

	});
}