
function def(obj, key, val) {
	Object.defineProperty(obj, key, {
		value: val,
		enumerable: true,
		writable: true,	
		configurable: true
	});
} 

function isObject (obj) {
  return obj !== null && typeof obj === 'object'
}

function hasOwnProperty (obj, key) {
  return Object.prototype.hasOwnProperty.call(obj, key)
}

/***** ****/

function observe(data) {
	if ( !isObject(data) )
		return ;
	var ob;
	if (hasOwnProperty(data, '__ob__') && data.__ob__ instanceof Observer) {
		ob = data.__ob__;
	}else {
		ob = new Observer(data);
	}
	return ob;
}

function defineReactive$$1 (obj, key, val) {
	//console.log(key);
	var property = Object.getOwnPropertyDescriptor(obj, key);
  	if (property && property.configurable === false) {
    	return
  	}
  	// 
  	var getter = property && property.get;
  	var setter = property && property.set;
	var childOb = observe(val);
	Object.defineProperty(obj, key, {
		enumerable: true,
    	configurable: true,
    	get: function reactiveGetter () {
      		var value = getter ? getter.call(obj) : val;
      		console.log(`你访问了属性 ${key}`);
      		return value;
    	},
    	set: function reactiveSetter (newVal) {
    		var value = getter ? getter.call(obj) : val;
    		if (newVal === value || (newVal !== newVal && value !== value)) {
    			// 防止下一个if 发生死循环
    			console.log(`你设置了属性 ${key}，但什么也没发生`);
        		return;
      		}
      		if (setter) {
        		setter.call(obj, newVal);
      		} else {
        		val = newVal;
      		}
      		console.log(`你设置了属性 ${key}，value=${newVal}`);
      		
      		childOb = observe(newVal);
      		// set时的this，指向这个key的obj
      		// console.log(this)
      		this.__ob__.pubsub.emit(key, newVal);

    	}

	});
}

function Observer(data) {
	this.data = data;
	this.pubsub = new PubSub();
	this.walk(data);
	def(data, '__ob__', this);
}

Observer.prototype.walk = function(obj){
	var keys = Object.keys(obj);
  	for (var i = 0; i < keys.length; i++) {
    	defineReactive$$1(obj, keys[i], obj[keys[i]]);
  	}
}

Observer.prototype.$watch = function(key, handler){
	this.pubsub.on(key, handler);
}


/**** pub/sub模式 ****/
function PubSub(){
	this.handlers = {};
}

PubSub.prototype = {
	//订阅事件
	on : function(eventType, handler){
		var self = this;

		if (!(eventType in self.handlers)) {
			self.handlers[eventType] = [];
		}
		self.handlers[eventType].push(handler);
		//console.log(this);
		return this;
	},
	// 触发事件(发布事件)
	emit: function(eventType) {
		let self = this;
		if( Object.getOwnPropertyDescriptor(self.handlers, eventType) ){
			//console.log(eventType)
			var handlerArgs = Array.prototype.slice.call(arguments, 1);
			for (var i = 0; i<self.handlers[eventType].length; i++) {
				self.handlers[eventType][i].apply(self, handlerArgs);
			}
		}
		return self;
	}
}



