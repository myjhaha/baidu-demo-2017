function Observer(data){
	this.data = data;
	this.walk(data);
}

let p = Observer.prototype;

p.walk = function(obj){
	let val; 
	for (let key in obj) {
		if (obj.hasOwnProperty(key)){
			val = obj[key];

			if (typeof val === 'object'){
				new Observer(val);
			}

			this.convert(key, val);
		}
	}
}

p.convert = function (key, val){
	Object.defineProperty(this.data, key, {
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