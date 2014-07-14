/*!
 * Maggi.js JavaScript Library 
 * https://home.thilomaurer.de/Maggi.js
 *
 * Copyright (C) 2014-05-22 Thilo Maurer
 * All Rights Reserved.
 * 
 */

var Maggi=function(other) {
	var d={},p={},events={};

	if (!(other instanceof Date)) if (!(other instanceof Function)) if (other instanceof Object) if (other._hasMaggi) return other;

	var trigger = function(e,key,value,oldv) {
		var fns=events[e];
		if (fns==null) return;
		for (var i = fns.length-1; i >= 0; --i) {
			var f=fns[i];
			f(key,value,oldv);
		}
	}

	func = {
		add: function(key,value) {
			if (!(value instanceof Date)) if (!(value instanceof Function)) if (value instanceof Object) if (value._hasMaggi!=true) value=Maggi(value);
			var prop={ 
				get: function()  {
					var v=d[key];
					trigger("get",key,v);
					return v; 
				},
				set: function(v) {
					if (!(v instanceof Date)) if (!(v instanceof Function)) if (v instanceof Object) if (v._hasMaggi!=true) v=Maggi(v);
					var oldv=d[key];
					if (v==oldv) return;
					d[key]=v;
					trigger("set",key,v,oldv);
				},
				enumerable: true,
				configurable: true
			};
			var oldv=d[key];
			d[key]=value;
			if (p.hasOwnProperty(key)) { 
				console.log('Maggi: attempt to redefine property "'+key+'" of '+JSON.stringify(p)+'.');
				trigger("set",key,value,oldv);
				return;
			} else {
				Object.defineProperty(p,key,prop);
				//propage child events to parent
				if (value&&value.bind) {
					value.bind(["set","remove","add"],function(innerkey,v,oldv) {
						var bubblekey;
						if (innerkey instanceof Array)
							bubblekey=innerkey.slice(0);
						else 
							bubblekey=[innerkey];

						bubblekey.unshift(key);
						trigger("set",bubblekey,v,oldv);
					});
				}
				trigger("add",key,value);
			}
		},
		remove: function(key) {
			if (!d.hasOwnProperty(key)) return;
			var value=d[key];
			delete p[key];
			delete d[key];
			trigger("remove",key,value); //fire remove last time
			p.unbind(key);               //before removing all bindings for key
		},
		bind: function(ks,fn) {
			if (typeof ks === 'function') { fn=ks; ks=["set"]; }
			if (!(fn instanceof Array)) fn=[fn];
			if (typeof ks === "string") ks=[ks];
			for (var ik in ks) {
				var k=ks[ik];
				for (var i in fn) {
					if (events[k]==null) events[k]=[];
					events[k].push(fn[i]);
				}
			}
		},
		unbind: function(ks,fn) {
			if (typeof ks === "string") ks=[ks];
			if (fn==null) {
				//remove all bindings for each keys in ks
				for (var ik in ks) {
					var k=ks[ik];
					events[k]=[];
				}
				return;
			}
			if (!(fn instanceof Array)) fn=[fn];
			for (var ik in ks) {
				var k=ks[ik];
				if (events[k]) for (var i in fn) { 
					var idx=events[k].indexOf(fn[i]);
					if (idx>=0) events.splice(idx,1);
				}
			}
		},
		set: function(kv) {
			for (var i = 0; i<kv.length; i++) {
				var k=kv[i][0];
				var v=kv[i][1];
				d[k]=v;
				trigger("set",k,v);
			}
		},
		trigger: trigger,
		_hasMaggi: true
	};

	for (var key in func) {
		var value=func[key];
		Object.defineProperty(p,key,{value:value, enumerable:false, writeable:false, configurable:false});
	}

	if (other) for (var key in other) {
		var value=other[key];
		p.add(key,value);
	}

	return p;
}

