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
		//for (var i = fns.length-1; i >= 0; --i) { //why did I do this backward orginally?
		for (var i=0; i<fns.length; i++) { //why did I do this backward orginally?
			var f=fns[i];
			f(key,value,oldv);
		}
	}

	func = {
		add: function(key,value) {
			var get = function() {
					var v=d[key];
					trigger("get",key,v);
					return v; 
			};
			var set = function(v) {
				if (!(v instanceof Date)) if (!(v instanceof Function)) if (v instanceof Object) if (v._hasMaggi!=true) v=Maggi(v);
				var oldv=d[key];
				if (v==oldv) return;
				uninstallBubble(oldv);
				installBubble(v);
				d[key]=v;
				trigger("set",key,v,oldv);
			}
			var bubbleEvents=["set","remove","add"];
			var bubble=function(e,k,v,oldv) {
				var bubblekey;
				if (k instanceof Array)
					bubblekey=k.slice(0);
				else 
					bubblekey=[k];

				bubblekey.unshift(key);
				trigger(e,bubblekey,v,oldv);
			};
			var bubbleFuncs={};
			bubbleEvents.forEach(function(e) {
				bubbleFuncs[e]=function(k,v,oldv) { bubble(e,k,v,oldv) };
			});
			var installBubble=function(value) {
				//propage child events to parent
				if (value&&value._hasMaggi) {
					bubbleEvents.forEach(function(e) {
						value.bind(e,bubbleFuncs[e]);
					});
				}
			}
			var uninstallBubble=function(value) {
				if (value&&value._hasMaggi) {
					bubbleEvents.forEach(function(e) {
						value.unbind(e,bubbleFuncs[e]);
					});
				}
			}
			if (p.hasOwnProperty(key)) { 
				console.log('Maggi: set by add for property "'+key+'" of '+JSON.stringify(p)+'.');
				set(value);
				return;
			} else {
				if (!(value instanceof Date)) if (!(value instanceof Function)) if (value instanceof Object) if (value._hasMaggi!=true) value=Maggi(value);
				d[key]=value;
				var prop={get: get, set: set, enumerable: true, configurable: true};
				Object.defineProperty(p,key,prop);
				installBubble(value);
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
					if (idx>=0) events[k].splice(idx,1);
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

