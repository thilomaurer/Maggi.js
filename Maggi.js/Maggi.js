/*!
 * Maggi.js JavaScript Library 
 * https://home.thilomaurer.de/Maggi.js
 *
 * Copyright (C) 2017-01-03 Thilo Maurer
 * All Rights Reserved.
 * 
 */

var Maggi=function(other) {
    var d={},p={},events={};
    var bubbleEvents=["set","remove","add"];
    var bubbles={};

    if (!(other instanceof Date)) if (!(other instanceof Function)) if (other instanceof Object) if (other._hasMaggi) return other;
    //if (other instanceof jQuery) return other;

	var trigger = function(e,key,value,oldv) {
		var fns=events[e];
		if (fns==null) return;
		//since fns may be changed during a trigger, may result in infinite loop
		//BUG: take fixed length for now
		//TODO: trigger by copy of fns
		var fnsl=fns.length; 
		if (Maggi.log==true) 
			console.log("Maggi.log: trigger "+fnsl+" "+e+" for "+JSON.stringify(key));
		for (var i=0; i<fnsl; i++) {
			var f=fns[i];
			if (!f.keys||(f.keys.indexOf(key)>-1)) {
				f.fn(key,value,oldv,e);
			}
		}
	};

	var installBubble=function(value,bubbleFuncs) {
		if (value&&value._hasMaggi) {
			bubbleEvents.forEach(function(e) {
				value.bind(e,bubbleFuncs[e]);
			});
		}
	};

	var uninstallBubble=function(value,bubbleFuncs) {
		if (value&&value._hasMaggi) {
			bubbleEvents.forEach(function(e) {
				value.unbind(e,bubbleFuncs[e]);
			});
		}
	};

	var bubble=function(e,key,k,v,oldv) {
		var bubblekey;
		if (k instanceof Array)
			bubblekey=k.slice(0);
		else 
			bubblekey=[k];

		bubblekey.unshift(key);
		trigger(e,bubblekey,v,oldv);
	};

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
				uninstallBubble(oldv,bubbleFuncs);
				installBubble(v,bubbleFuncs);
				d[key]=v;
				trigger("set",key,v,oldv);
			};
			var bubbleFuncs={};
			bubbles[key]=bubbleFuncs;
			bubbleEvents.forEach(function(e) {
				bubbleFuncs[e]=function(k,v,oldv) { bubble(e,key,k,v,oldv) };
			});
			if (p.hasOwnProperty(key)) { 
				//console.log('Maggi: set by add for property "'+key+'" of '+JSON.stringify(p)+'.');
				set(value);
				return;
			} else {
				if (!(value instanceof Date)) if (!(value instanceof Function)) if (value instanceof Object) if (value._hasMaggi!=true) value=Maggi(value);
				d[key]=value;
				var prop={get: get, set: set, enumerable: true, configurable: true};
				Object.defineProperty(p,key,prop);
				installBubble(value,bubbleFuncs);
				trigger("add",key,value);
			}
		},
		remove: function(key) {
			if (!d.hasOwnProperty(key)) return;
			var value=d[key];
			delete p[key];
			delete d[key];
			uninstallBubble(value,bubbles[key]);
			trigger("remove",key,value); //fire remove last time
		},
		bind: function() {
			var ts,ks,fn;
			var arg=arguments;
			var n=arg.length;
			var makeArray = function(idx) {
				var a=arg[idx];
				if (a instanceof Array) return a;
				return [a];
			};
			if (n>=3) {
				ts=makeArray(0);
				ks=makeArray(1);
				fn=makeArray(2);	
			}
			if (n==2) {
				ts=makeArray(0);	
				ks=null;	
				fn=makeArray(1);	
			}
			if (n==1) {
				ts=["set"];	
				ks=null;	
				fn=makeArray(0);	
			}
			var stacktrace=function() {
				var s=(new Error()).stack.split("\n");
				return s.splice(2).map(function(s) {
						var fields=s.match(/ at (.*) \((.*)\)/);
						if (fields==null) fields=s.match(/ at ()(.*)/);
						return {fn:fields[1],loc:fields[2]};
					});
			};
			for (var ik in ts) {
				var k=ts[ik];
				if (events[k]==null) events[k]=[];
				for (var i in fn) {
				    var e;
					if (Maggi.trace) {
					    e={
    						fn:fn[i],
    						keys:ks,
    						id:Maggi.bind_id++,
    						trace:stacktrace()
    					};
    					console.log("bind",e.id,e.keys);
					} else {
    					e={
    						fn:fn[i],
    						keys:ks
    					};
					}
					events[k].push(e);
				}
			}
		},
		unbind: function(ks,fn) {
			if (typeof ks === 'function') { fn=ks; ks=["set"]; }
			if (typeof ks === "string") ks=[ks];
			if (fn==null) {
				//remove all bindings for each keys in ks
				for (var ik in ks) {
					var k=ks[ik];
					events[k]=[];
				}
				return;
			}
			var indexOf=function(A,propname,value) {
				if (!A) return -1;
				for (var idx=0;idx<A.length;idx++) {
					var v=A[idx];
					if (v.hasOwnProperty(propname))
						if (v[propname]==value) return idx;
				}
				return -1;
			};
			if (!(fn instanceof Array)) fn=[fn];
			for (var ik in ks) {
				var k=ks[ik];
				if (events[k]) for (var i in fn) { 
					//var idx=events[k].indexOf(fn[i]);
					var idx=indexOf(events[k],"fn",fn[i]);
					if (idx>=0&&Maggi.trace) {
					    console.log("unbind",events[k][idx].id,events[k][idx].keys);
					}
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

	var myeach=function(o,action) {
		if (o)
			for (var k in o) 
				action(k,o[k]);
	};
	myeach(func,function(key,value) {
		Object.defineProperty(p,key,{value:value, enumerable:false, writeable:false, configurable:false});
	});
	myeach(other,p.add);

	return p;
};

Maggi.merge = function(obj1, obj2) {
	for (var p in obj2) {
		if (obj1[p]&&(obj1[p].constructor==Object)) {
			Maggi.merge(obj1[p], obj2[p]);
		} else {
			obj1.add(p,obj2[p]);
		}
	}
};

Maggi.bind_id=0;
Maggi.trace=false;

Maggi.apply = function(data,d) {
	var e=d.e; var k=d.k; var v=d.v;
	if (Maggi.apply.log) console.log("Maggi.apply: e="+e+", k="+k);
	if (k==null) {
		for (var k in v) 
			data.add(k,v[k]);
	} else if (k instanceof Array) {
		var k0=k.shift();
		var d0=data[k0];
		if (d0==null) {
			var o;
			var oo=v;
			for (var i=k.length-1;i>=0;i--) {
				o={}; o[k[i]]=oo;
				oo=o;
			}
			data.add(k0,oo);
		} else {
			if (k.length==1) d.k=k[0];
			Maggi.apply(d0,d);
		}
	} else {
		if (e=="set")
			data[k]=v;
		if (e=="remove")
			data.remove(k);
		if (e=="add")
			data.add(k,v);
	}
};

Maggi.db=function() { return Maggi.db.client.apply( this, arguments ); };

Maggi.db.load=function(dbname,bindfs) {
	var db;
	var dirname=process.cwd();
	var basename=dirname + "/" + Maggi.db.server.path + "/" + dbname;
	var dbjson=basename+".json";
	var dbdir=basename + ".fs/";
	var enc="utf8";
	try {
		db=fs.readFileSync(dbjson, enc);
	} catch(e) {
	    console.log("Initializing new db '"+dbname+"' from " + dbjson);
	    db='{"data":{},"rev":0}';
	}
	console.log("Loading db '"+dbname+"' from " + dbjson);
	try {
		db=JSON.parse(db);
	} catch(e) {
		console.log("Error parsing Maggi.db '"+dbname+"': "+e);
		process.exit(1);
	}
	var stringify=function() { return JSON.stringify(db, null, '\t'); };
	db=Maggi(db);
	db.bind("set","rev",function() {
		writefile(dbjson, stringify, enc);
	});
	db.data.bind(["set","add","remove"],function() {
		db.rev+=1;
	});

	var saveFS=function(k,v) {
		if (v instanceof Object) {
			for (var k1 in v) 
				saveFS(k.concat(k1),v[k1]);
			return;
		}
		if (k instanceof Array) k=k.join("/");
		var fp=dbdir+k;
		writefile(fp,v,enc);
	};

	if (bindfs) db.bind("set",saveFS);
	return db;
};

Maggi.db.ionamespace="/Maggi.db";

Maggi.db.server=function(io,preload) {
	var dbs={};
	if (preload!=null) dbs[preload]=Maggi.db.load(preload,false);
	io.of(Maggi.db.ionamespace).on('connection', function(socket) {
		if (Maggi.db.server.log)
			console.log(socket.id,"connected");
		socket.on("Maggi.db",function(dbname) {
			if (dbs[dbname]===undefined) 
				dbs[dbname]=Maggi.db.load(dbname,false);
			Maggi.db.sync(socket,dbname,dbs[dbname],false);
		});
		socket.on('disconnect',function(e) {
			if (Maggi.db.server.log)
				console.log(socket.id,"disconnect",e);
		});
	});
	return dbs;
};

Maggi.db.server.path="db";

Maggi.db.sync = function(socket,dbname,db,client,events,onsync) {
	var applying=false;
	var mk="Maggi.db."+dbname;
	var dshort=function(d) {
		if (d==null) return "(null)"; 
		var k=d.k;
		if (k instanceof Array) k=k.join(".");
		var l=d.v&&JSON.stringify(d.v).length;
		return d.rev + " " + d.f + " " + d.e + " " + k + " " + l;
	};
	var log=function(key,d) {
		if (Maggi.db.sync.log)
			console.log(socket.id,key,mk,dshort(d));
	};
	log({true:"client",false:"serve"}[client]);
	var emit=function(d) { log("emit",d); socket.emit(mk,d); };
	var handler=function(k,v,oldv,e) {
		if (applying) return;
		emit({f:"delta",e:e,k:k,rev:db.rev,v:v});
	};
	var apply=function(d) {
		applying=true;
		Maggi.apply(db.data,d);
		db.rev=d.rev;
		applying=false; 
	};
	db.data.bind(["set","add","remove"],handler);
	socket.on(mk, function(d) {
		log("recv",d);
		if (d.f=="delta") {
			if (d.rev==db.rev+1) {
				apply(d);
			} else {
				emit({f:"error",id:"old_rev", cur_rev:db.rev, req_rev:d.rev});
			}
		}
		if (d.f=="request") 
			emit({f:"response",e:"add",k:null,v:db.data,rev:db.rev});
		if (d.f=="response") { 
			apply(d);
			if (onsync) onsync();
			if (events&&events.ready) events.ready(dbname,db.data);
		}
		if (d.f=="error") 
			if (client&&d.id=="old_rev") emit({f:"request"});

	});
/*
	socket.on('disconnect',function() {
		db.data.unbind(handler);
	});
	socket.on('reconnect',function(e) {
		db.data.bind(["set","add","remove"],handler);
	});
*/
	if (client) emit({f:"request"});
};

Maggi.db.client = function(dbname,events,defs) {
	var add_unset=function(o,def) {
		for (var k in def) {
			if (o[k]==null) o.add(k,def[k]);
		else
			if (o[k] instanceof Object) add_unset(o[k],def[k]);
		}
	};
	
	var data=Maggi({});
	var db={data:data,rev:0};
	db.data.bind(["set","add","remove"],function() { db.rev+=1; });
	var socket = io(Maggi.db.ionamespace);
	var onsync=function() {
		add_unset(data,defs);
	};
	var register=function() {
		socket.emit("Maggi.db",dbname);
	};
	
	socket.on("reconnect",register);
	var evs=['error','disconnect','reconnect','reconnect_attempt','reconnect_error','reconnect_failed'];
	evs.forEach(function(v) {
		socket.on(v,function(e) {
			if (Maggi.db.client.log)
				console.log(socket.id,v,e);
			if (events[v]) events[v](e);
		});
	});
	register();
	Maggi.db.sync(socket,dbname,db,true,events,onsync);
	return data;
};

if (typeof module !== 'undefined') {
    var fs = require('fs'),
        writefile = require('./writefile.js');
	module.exports = Maggi;
}
