/*!
 * Maggi.js JavaScript framework
 * Thilo Maurer
 * https://github.com/thilomaurer/Maggi.js
 * LAGPL-3.0 - https://github.com/thilomaurer/Maggi.js/blob/master/LICENSE
 */

var Maggi = function(other) {
	var d = {},
	    p = {},
	    events = {};
	var bubbleEvents = ["set", "remove", "add"];
	var bubbles = {};

	if (!(other instanceof Date))
		if (!(other instanceof Function))
			if (other instanceof Object)
				if (other._hasMaggi) return other;
	if (typeof jQuery !== 'undefined' && other instanceof jQuery) return other;

	var indexOf = function(keys, key) {
		if (key == null) return -1;
		var l = keys.length;
		for (var i = 0; i < l; i++) {
			var k = keys[i];
			if (k == key) return i;
			if (k.length == key.length) { // "<="" since k needs to be no full match of Key
				var found = true;
				for (var j = 0; j < k.length; j++)
					found &= (k[j] == key[j]) || k[j] == "*";
				if (found) return i;
			}
		}
		return -1;
	};

	var trigger = function(e, key, value, oldv) {
		var fns = events[e];
		if (fns == null) return;
		if (Maggi.log == true) {
			var keytrace=key;
			if (key instanceof Array)
				keytrace=key.slice().reverse().join("->");
			console.log("Maggi.trigger:", fns.length, "triggers of " + e + " for ", keytrace, p);
			if (Maggi.logtrace == true) {
				var stacktrace = function() {
					var s = (new Error()).stack.split("\n");
					return s.splice(2).map(function(s) {
						var fields = s.match(/ at (.*) \((.*)\)/);
						if (fields == null) fields = s.match(/ at ()(.*)/);
						return { fn: fields[1], loc: fields[2] };
					});
				};
				console.log(stacktrace());
			}
		}
		//trigger all fns once, even those newly added or removed during execution of these
		var fns_complete=[];
		var fns_complete_added=true;
		while (fns_complete_added) {
			fns_complete_added=false;
			for (var i=0;i<fns.length;i++) {
				var f = fns[i];
				if (fns_complete.indexOf(f)==-1) {
					if (Maggi.trace === true) console.log("Maggi.trigger:", f.keys, key);
					if (!f.keys || (indexOf(f.keys, key) > -1))
						f.fn(key, value, oldv, e);
					fns_complete.push(f);
					fns_complete_added=true;
				}
			}
		}
	};

	var installBubble = function(value, bubbleFuncs) {
		if (value && value._hasMaggi)
			bubbleEvents.forEach(function(e) {
				value.bind(e, bubbleFuncs[e]);
			});
	};

	var uninstallBubble = function(value, bubbleFuncs) {
		if (value && value._hasMaggi)
			bubbleEvents.forEach(function(e) {
				value.unbind(e, bubbleFuncs[e]);
			});
	};

	var bubble = function(e, key, k, v, oldv) {
		var bubblekey;
		if (k instanceof Array)
			bubblekey = k.slice(0);
		else
			bubblekey = [k];

		bubblekey.unshift(key);
		trigger(e, bubblekey, v, oldv);
	};

	func = {
		add: function(key, value) {
			if (key == null) return console.warn("Maggi.js: ignoring add of member (null)");
			var get = function() {
				var v = d[key];
				trigger("get", key, v);
				return v;
			};
			var set = function(v) {
				if (!(v instanceof Date))
					if (!(v instanceof Function))
						if (v instanceof Object)
							if (v._hasMaggi != true) v = Maggi(v);
				var oldv = d[key];
				if (v != v) return;
				if (v == oldv) return;
				uninstallBubble(oldv, bubbleFuncs);
				installBubble(v, bubbleFuncs);
				d[key] = v;
				trigger("set", key, v, oldv);
			};
			var bubbleFuncs = {};
			bubbles[key] = bubbleFuncs;
			bubbleFuncs.set = function set_bubble(k, v, oldv) { bubble("set", key, k, v, oldv) };
			bubbleFuncs.add = function add_bubble(k, v, oldv) { bubble("add", key, k, v, oldv) };
			bubbleFuncs.remove = function remove_bubble(k, v, oldv) { bubble("remove", key, k, v, oldv) };
			if (p.hasOwnProperty(key)) {
				//console.log('Maggi.add: set by add for property "'+key+'" of '+JSON.stringify(p)+'.');
				set(value);
				return;
			} else {
				if (!(value instanceof Date))
					if (!(value instanceof Function))
						if (value instanceof Object)
							if (value._hasMaggi != true) value = Maggi(value);
				d[key] = value;
				var prop = { get: get, set: set, enumerable: true, configurable: true };
				Object.defineProperty(p, key, prop);
				installBubble(value, bubbleFuncs);
				trigger("add", key, value);
			}
		},
		remove: function(key) {
			if (key == null) return console.warn("Maggi.js: ignoring remove of member (null)");
			if (!d.hasOwnProperty(key)) return;
			var value = d[key];
			delete p[key];
			delete d[key];
			uninstallBubble(value, bubbles[key]);
			trigger("remove", key, value);
		},
		bind: function() {
			var ts, ks, fn;
			var arg = arguments;
			var n = arg.length;
			var makeArray = function(idx) {
				var a = arg[idx];
				return [a];
			};
			if (n >= 3) {
				ts = makeArray(0);
				if ((arg[1] instanceof Array) && (arg[1][0] instanceof Array)) {
					ks = arg[1];
				} else
					ks = makeArray(1);
				fn = makeArray(2);
			}
			if (n == 2) {
				ts = makeArray(0);
				ks = null;
				fn = makeArray(1);
			}
			if (n == 1) {
				ts = ["set"];
				ks = null;
				fn = makeArray(0);
			}
			var stacktrace = function() {
				var s = (new Error()).stack.split("\n");
				return s.splice(2).map(function(s) {
					var fields = s.match(/ at (.*) \((.*)\)/);
					if (fields == null) fields = s.match(/ at ()(.*)/);
					return { fn: fields[1], loc: fields[2] };
				});
			};
			for (var ik in ts) {
				var k = ts[ik];
				if (events[k] == null) events[k] = [];
				for (var i in fn) {
					var e;
					if (Maggi.trace) {
						e = {
							fn: fn[i],
							keys: ks,
							id: Maggi.bind_id++,
							trace: stacktrace()
						};
						console.log("Maggi.bind:", e.id, e.keys);
					} else {
						e = {
							fn: fn[i],
							keys: ks
						};
					}
					events[k].push(e);
				}
			}
		},
		unbind: function(ks, fn) {
			if (typeof ks === 'function') { fn = ks;
				ks = ["set"]; }
			if (typeof ks === "string") ks = [ks];
			if (fn == null) {
				//remove all bindings for each keys in ks
				for (var ik in ks) {
					var k = ks[ik];
					events[k] = [];
				}
				return;
			}
			var indexOf = function(A, propname, value) {
				if (!A) return -1;
				for (var idx = 0; idx < A.length; idx++) {
					var v = A[idx];
					if (v.hasOwnProperty(propname))
						if (v[propname] == value) return idx;
				}
				return -1;
			};
			if (!(fn instanceof Array)) fn = [fn];
			for (var ik in ks) {
				var k = ks[ik];
				if (events[k])
					for (var i in fn) {
						var idx;
						do {
							idx = indexOf(events[k], "fn", fn[i]);
							if (idx >= 0 && Maggi.trace)
								console.log("unbind", events[k][idx].id, events[k][idx].keys);
							if (idx >= 0) events[k].splice(idx, 1);
						} while (idx >= 0);
					}
			}
		},
		set: function(kv) {
			var tk = [];
			var ov = {};
			var set = function(key, v) {
				if (!(v instanceof Date))
					if (!(v instanceof Function))
						if (v instanceof Object)
							if (v._hasMaggi != true) v = Maggi(v);
				var oldv = d[key];
				if (v != v) return;
				if (v == oldv) return;
				//uninstallBubble(oldv);
				//installBubble(v);
				d[key] = v;
				ov[key] = oldv;
				tk.push(key);
			};
			for (var i = 0; i < kv.length; i++) {
				var k = kv[i][0];
				var v = kv[i][1];
				set(k, v);
			}
			tk = [tk[0]];
			for (var i = 0; i < tk.length; i++) {
				var k = tk[i];
				var v = d[k];
				var oldv = ov[k];
				trigger("set", k, v, oldv);
			}
		},
		trigger: trigger,
		_hasMaggi: true
	};

	var myeach = function(o, action) {
		if (o)
			for (var k in o)
				action(k, o[k]);
	};
	myeach(func, function(key, value) {
		Object.defineProperty(p, key, { value: value, enumerable: false, writeable: false, configurable: false });
	});
	myeach(other, p.add);

	Object.defineProperty(p, "__uniqueid", {
		value: Maggi.ID++,
		enumerable: false,
		writable: false
	});
	return p;
};
Maggi.ID = 0;

Maggi.merge = function(obj1, obj2) {
	for (var p in obj2) {
		if (obj1[p] && (obj1[p].constructor == Object)) {
			Maggi.merge(obj1[p], obj2[p]);
		} else {
			obj1.add(p, obj2[p]);
		}
	}
};

Maggi.bind_id = 0;
Maggi.trace = false;

Maggi.apply = function(data, d) {
	var e = d.e;
	var k = d.k;
	var v = d.v;
	if (Maggi.apply.log) console.log("Maggi.apply: e=" + e + ", k=" + k);
	if (k == null) {
		for (var k in v)
			data.add(k, v[k]);
	} else if (k instanceof Array) {
		var k0 = k.shift();
		var d0 = data[k0];
		if (d0 == null) {
			var o;
			var oo = v;
			for (var i = k.length - 1; i >= 0; i--) {
				o = {};
				o[k[i]] = oo;
				oo = o;
			}
			data.add(k0, oo);
		} else {
			if (k.length == 1) d.k = k[0];
			Maggi.apply(d0, d);
		}
	} else {
		if (!data.hasOwnProperty(k)&&e=="set")
			e="add";
		if (e == "set")
			data[k] = v;
		if (e == "remove")
			data.remove(k);
		if (e == "add")
			data.add(k, v);
	}
};

Maggi.db = function() { return Maggi.db.client.apply(this, arguments); };


Maggi.db.load = function(filename, enc, cb) {
	var db;
	try {
		db = fs.readFileSync(filename, enc);
	} catch (e) {
		console.warn("Error reading file '" + filename + "': ", e);
		return;
	}
	try {
		db = JSON.parse(db);
	} catch (e) {
		console.warn("Error parsing Maggi.db '" + filename + "': ", e);
		return;
	}
	cb(db);
}

Maggi.db.create = function(server, dbreq, cb, useroptions) {
	if (Maggi.db.server.log)
		console.log("create", dbreq);
	var dbname = dbreq.id_str;
	var options = {
		bindfs: false,
		persistant: true,
		loadexisiting: true,
		initialdata: {},
		initialrev: 0,
		enc: "utf8"
	};
	for (var k in useroptions)
		options[k] = useroptions[k];

	var dirname = process.cwd();
	var basename = dirname + "/" + Maggi.db.server.path + "/" + dbname;
	var dbjson = basename + ".json";

	function bindfs(db) {
		var dbdir = basename + ".fs/";
		var saveFS = function(k, v) {
			if (v instanceof Object) {
				for (var k1 in v)
					saveFS(k.concat(k1), v[k1]);
				return;
			}
			if (k instanceof Array) k = k.join("/");
			var fp = dbdir + k;
			writefile(fp, v, options.enc);
		};
		db.bind("set", saveFS);
	};

	var stringify = function(db) { return JSON.stringify(db, null, '\t')+'\n'; };
	
	var save_active=false;
	var delay=10000;

	function save(db) {
		if (save_active) return;
		save_active=true;
		setTimeout(() => {
			save_now(db);
			save_active=false;
		},delay);
	}

	function save_now(db) {
		writefile(dbjson, stringify(db), options.enc);
	};
	function bindsave(db) {
		db.bind("set", "rev", function() { save(db) });
	};

	function engage(db) {
		if (server.dbs[dbname].state != "vive") return;
		var handler = function() {
			db.rev += 1;
		};
		db.data.bind("set", handler);
		db.data.bind("add", handler);
		db.data.bind("remove", handler);

		if (options.bindfs) bindfs(db);
		if (options.persistant) bindsave(db);

		server.dbs[dbname] = db;
		if (Maggi.db.server.log)
			console.log("engage", dbreq);
		if (cb) cb(db);
	};

	function initcomplete(db) {
		if (db == null) return;
		if (server.dbs[dbname].state != "vive") return;
		db = Maggi(db);
		var ch = options.createhook;
		if (ch) ch(server, dbreq, db, function() { engage(db); });
		else engage(db);
	};

	if (options.persistant || options.loadexisting) {
		if (fs.existsSync(dbjson)) {
			console.log("loading " + dbname + " from file");
			Maggi.db.load(dbjson, options.enc, initcomplete);
		} else {
			var db={ data: options.initialdata, rev: options.initialrev };
			save(db);
			initcomplete(db);
		}
	}
};

Maggi.db.ionamespace = "/Maggi.db";

Maggi.db.server = function(io, dbnames) {
	if (typeof dbnames === 'string') dbnames = [dbnames];
	var server = {
		dbs: {},
		dbnames: dbnames||[],
		io: io,
		clients: {},
		requesthook: null
	};

	io.of(Maggi.db.ionamespace).on('connection', function(socket) {
		if (Maggi.db.server.log)
			console.log(socket.id, "connected");
		clientdbs = [];
		server.clients[socket.id] = clientdbs;
		socket.on("Maggi.db", function(dbreq) {
			if (dbreq == null) {
				console.warn("empty Maggi.db received");
				return;
			}
			if (typeof dbreq === 'string') dbreq = { id: dbreq };
			var startsync = function(db) {
				var dbid = dbreq.id_str;
				if (clientdbs.indexOf(dbid) == -1) {
					clientdbs.push(dbid);
					if (Maggi.db.server.log)
						console.log("startsync", dbreq);
					Maggi.db.sync(socket, dbreq, db, false, null, null, dbreq.stockChart == "AAPL");
					socket.emit("Maggi.db." + dbid, { f: "connected" });
				} else {
					if (Maggi.db.server.log)
						console.log("command", dbreq);
					if (db.req) db.req(dbreq);
				}
			};
			Maggi.db.server.vive(server, dbreq, startsync);
		});
		socket.on('disconnect', function(e) {
			if (Maggi.db.server.log)
				console.log(socket.id, "disconnect", e);
		});
	});
	return server;
};

Maggi.db.server.path = "db";

Maggi.db.server.vive = function(server, dbreq, callback) {
	if (dbreq.id_str === undefined) dbreq.id_str = (typeof dbreq.id === "string") ? dbreq.id: JSON.stringify(dbreq.id);
	var db = server.dbs[dbreq.id_str];
	var dbns = server.dbnames;
	if (db === undefined) {
		server.dbs[dbreq.id_str] = {state:"vive", callbacks:[callback]};
		db = server.dbs[dbreq.id_str];
		var accept = function(options) {
			var pdb=db;
			Maggi.db.create(server, dbreq, function(db) {
				for (var i in pdb.callbacks) {
					var cb = pdb.callbacks[i];
					if (cb) cb(db);
				}
			}, options);
		};
		var rh = server.requesthook;
		if (dbns && dbns.indexOf(dbreq.id_str) != -1) accept();
		else if (rh) rh(dbreq, accept);
		else
			console.log("rejected", dbreq);
	} else if (db.state == "vive") {
		if (callback) db.callbacks.push(callback);
	} else
		if (callback) callback(db);
}

Maggi.db.sync = function(socket, dbreq, db, client, events, onsync, synclog) {
	var dbname = dbreq.id_str;
	var applying = false;
	var mk = "Maggi.db." + dbname;
	var dshort = function(d) {
		if (d == null) return "(null)";
		var k = d.k;
		if (k instanceof Array) k = k.join(".");
		if (d.v instanceof Function)
			l = "function(...) {...}";
		else
			l = d.v && JSON.stringify(d.v).substring(0, 32);
		var str = d.f;
		if (d.rev != null)
			str += " " + d.rev;
		if (d.e != null)
			str += " " + d.e + " " + k + " " + l;
		return str;
	};
	var log = function(key, d) {
		if (synclog)
			if (d)
				console.log(socket.id, key, mk, dshort(d));
			else
				console.log(socket.id, key, mk);
	};
	log({ true: "client", false: "serve" }[client]);
	var emit = function(d) {
		log("emit", d);
		socket.emit(mk, d);
	};
	var handler = function(k, v, oldv, e) {
		if (applying) return;
		if (v instanceof Function)
			v=null;
		emit({ f: "delta", e: e, k: k, rev: db.rev, v: v });
	};
	var apply = function(d) {
		applying = true;
		Maggi.apply(db.data, d);
		db.rev = d.rev;
		applying = false;
	};
	var resync = function() {
		db.insync = false;
		console.log("requesting", dbname);
		emit({ f: "request" });
		db.waitsync = true;
	};
	db.data.bind("set", handler);
	db.data.bind("add", handler);
	db.data.bind("remove", handler);
	socket.on(mk, function(d) {
		log("recv", d);
		if (d.f == "delta") {
			if (db.insync && d.rev == db.rev + 1) {
				apply(d);
			} else {
				if (client) {
					db.insync=false;
					if (!db.waitsync) {
						log("out-of-sync client; requesting resync");
						resync();
					}
				} else {
					log("rejecting out-of-sync client request");
					emit({f:"error",id:"old_rev", cur_rev:db.rev, req_rev:d.rev});
				}
			}
		}
		if (d.f == "request")
			emit({ f: "response", e: "add", k: null, v: db.data, rev: db.rev });
		if (d.f == "response" && db.waitsync) {
			apply(d);
			db.insync = true;
			db.sync_count++;
			if (onsync) onsync();
			if (events && events.ready) events.ready(dbname, db.data);
		}
		if (d.f == "error")
			if (client && d.id == "old_rev") emit({ f: "request" });
		if (d.f == "connected")
			resync();
	});
	/*
		socket.on('disconnect',function() {
			db.data.unbind("set",handler);
			db.data.unbind("add",handler);
			db.data.unbind("remove",handler);
		});
	*/
	db.insync = !client;
	db.waitsync = false;
};

clientdbs = {};
Maggi.db.client = function(dbreq, events, defs, options) {
	var socket = Maggi.db.client.socket;
	options = options || {};
	Object.assign(options, Maggi.db.client.default_options);
	if (socket == null) {
		var url = options.url || "";
		url += Maggi.db.ionamespace;
		socket = io(url);
		Maggi.db.client.socket = socket;
	}
	if (typeof dbreq === 'string') dbreq = { id: dbreq };
	if (dbreq.id_str === undefined) dbreq.id_str = (typeof dbreq.id === "string") ? dbreq.id: JSON.stringify(dbreq.id);
	var dbname = dbreq.id_str;
	var raise_event=function(eventname) {
		if (options.eventlog === true)
			console.log(socket.id, eventname, dbname);
		var args=[].slice.call(arguments,1);
		db.events.forEach(function(evt) {
			if (evt[eventname]) evt[eventname].apply(null,args);
		});
	}
	if (clientdbs[dbname] !== undefined) {
		var db=clientdbs[dbname];
		if (db.events===undefined) db.events=[];
		if (events) db.events.push(events);
		if (dbreq.attr) {
			socket.emit("Maggi.db", dbreq);
		}
		var dbdata=db.data;
		if (db.insync) raise_event("ready",dbname,dbdata);
		if (db.insync) raise_event("first_sync",dbname,dbdata);
		return dbdata;
	}

	var add_unset = function(o, def) {
		for (var k in def) {
			var v=def[k];
			if (v instanceof Function) continue;
			if (o[k] == null) o.add(k, v);
			else if (o[k] instanceof Object) add_unset(o[k], v);
		}
	};

	var data = Maggi({});
	var db = { data: data, rev: 0, insync: false, sync_count:0, events:[] };
	if (events) db.events.push(events);
	clientdbs[dbname] = db;

	var handler = function() { db.rev += 1; };
	data.bind("set", handler);
	data.bind("add", handler);
	data.bind("remove", handler);

	var onsync = function() {
		if (db.rev == 0)
			add_unset(data, defs);
		if (db.sync_count==1) raise_event("first_sync",dbname,data);
	};
	var register = function() {
		socket.emit("Maggi.db", dbreq);
		raise_event("connecting",dbname);
	};

	socket.on("reconnect", register);
	var evs = ['error', 'disconnect', 'reconnect', 'reconnect_attempt', 'reconnect_error', 'reconnect_failed'];
	evs.forEach(function(v) {
		socket.on(v, function(e) {
			raise_event(v, dbname, e);
		});
	});
	Maggi.db.sync(socket, dbreq, db, true, events, onsync, options && options.synclog);
	register();
	return data;
};

Maggi.db.client.default_options = {};

if (typeof module !== 'undefined') {
	var fs = require('fs'),
		writefile = require('./writefile.js');
	module.exports = Maggi;
}
