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
                if (other._hasMaggi)
					return other;
    if (other instanceof Object)
		if (other.__proto__.jquery!=null)
			return other;

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

    var trigger = function(e, key, value, oldv, flags) {
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
		if (p._bubblelocal==true)
		    flags={bubblelocal:true};
        //trigger all fns once, even those newly added or removed during execution of these
        var fns_complete=[];
        var fns_complete_added=true;
        while (fns_complete_added) {
            fns_complete_added=false;
            for (var i=0;i<fns.length;i++) {
                var f = fns[i];
                if (fns_complete.indexOf(f)==-1) {
                    if (Maggi.trace === true) console.log("Maggi.trigger:", f.keys, key, flags);
                    if (!f.keys || (indexOf(f.keys, key) > -1))
                        f.fn(key, value, oldv, e, flags);
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

    var bubble = function(e, key, k, v, oldv, flags) {
		/*
		var pk=p[key];
        if (pk != null && pk._hasMaggi == true && pk._bubble == false) {
			//console.log("bubble inhibit",key,k,v,oldv);
			return;
		}
		*/
        var bubblekey;
        if (k instanceof Array)
            bubblekey = k.slice(0);
		else if (k === null)
			bubblekey = [];
        else
            bubblekey = [k];

        bubblekey.unshift(key);
        trigger(e, bubblekey, v, oldv, flags);
    };

	var pausebubble_data = null;
    var func = {
		beginlocal: function() {
			p._bubblelocal = true;
			pausebubble_data = JSON.parse(JSON.stringify(p));
		},
		endlocal: function() {
			p._bubblelocal = false;
			trigger("set",null,p,pausebubble_data);
			pausebubble_data = null;
		},
        add: function(key, value, notriggerbubble) {
            if (key == null) return console.warn("Maggi.js: ignoring add of member (null)");
            var get = () => d[key];
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
            bubbleFuncs.set = function set_bubble(k, v, oldv, e, flags) { bubble("set", key, k, v, oldv, flags) };
            bubbleFuncs.add = function add_bubble(k, v, oldv, e, flags) { bubble("add", key, k, v, oldv, flags) };
            bubbleFuncs.remove = function remove_bubble(k, v, oldv, e, flags) { bubble("remove", key, k, v, oldv, flags) };
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
                if (notriggerbubble!=true) trigger("add", key, value, undefined, (value && value._bubblelocal)?{bubblelocal:true}:undefined);
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
    Object.defineProperty(p, "_bubblelocal", {
        value: false,
        enumerable: false,
        writable: true
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

Maggi.assign_undefined_null = function(p, o) {
        for (var k in o) {
                if (p[k] === undefined || p[k] === null)
                        p.add(k, o[k]);
                else if (p[k] !== null && typeof p[k] === 'object')
                        Maggi.assign_unset(p[k], o[k]);
        }
};

Maggi.assign_unset = function(p, o) {
        for (var k in o) {
                if (p[k] === undefined)
                        p.add(k, o[k]);
                else if (p[k] !== null && typeof p[k] === 'object')
                        Maggi.assign_unset(p[k], o[k]);
        }
};

var mdbs=null;

Maggi.setMaggiServer = s => {
    mdbs=s;
};


Maggi.db = function(path,events,defs,options) {
    var p;
    var resync_cb=[];
	if (mdbs) 
		p = mdbs.db(path,events,defs,options)
	        .then(db => db.data);  //the server never resyncs it self - the truth is in the cloud
    else
        p = new Promise((resolve, reject) => {
            var pevents = {
                ready: db => {
                    resolve(db.data);
                    resync_cb.forEach(f => f(db.data));
                },
                resynced: db => {
                    resync_cb.forEach(f => f(db.data));
                },
                error: (db, err) => {
                    debugger;
                    reject(err);
                }
            };
            if (events==null)
                events = [];
            if (!(events instanceof Array))
                events = [events, pevents];
            else
                events = [...events, pevents];
            setTimeout(() => {
                Maggi.db.client(path,events,defs,options);
            },0);
        });
    p.ondata = function(f) {
        resync_cb.push(f);
        return p;
    };
    p.offdata = function(f) {
        resync_cb=resync_cb.filter(v => v!==f);
        return p;
    };
    p.discard = function(f) {
        resync_cb = [];
        return p;
    };
    return p;
};


Maggi.db.ionamespace = "/Maggi.db";

var hashCode = function(s) {
    var hash = 0;
    if (s.length == 0) {
        return hash;
    }
    for (var i = 0; i < s.length; i++) {
        var char = s.charCodeAt(i);
        hash = ((hash<<5)-hash)+char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
}

Maggi.db.fill_dbreq = function(dbreq) {
    if (dbreq == null) {
        console.warn("empty Maggi.db request received");
        return null;
    }
    if (typeof dbreq === 'string') dbreq = { name: dbreq };
    if (dbreq.type==null)
        dbreq.type="data";
    dbreq.req_date = new Date().getTime();
    dbreq.reqid = hashCode(JSON.stringify(dbreq));
    return dbreq;
}

Maggi.db.sync = function(socket, dbreq, db, client, raise_event, onsync, synclog) {
    var dbname = dbreq.name;
    var applying = false;
    var mk = "Maggi.db." + dbname;
    var server = !client;
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
    if (synclog)
        console.log(socket.id, "startsync", dbname);
    var emit = function(d) {
        log("emit", d);
        socket.emit(mk, d);
    };
    var clientinsync = false;
    var deltaid = 0;
    var handler = function(k, v, oldv, e, flags) {
        //ensure client does not reply with same delta back to server
        if (client && applying == db.rev + 1) return;
        if (v instanceof Function)
            v=null;
        var msg={ f: "delta", e: e, k: k, rev: db.rev, v: v };
        if (client) {
			if (flags && flags.bubblelocal) {
			} else {
                deltaid+=1;
                msg.deltaid=deltaid;
                emit(msg);
			}
        } else {
            if (clientinsync)
                emit(msg);
        }
    };
    var apply = function(d) {
        applying = d.rev;
        Maggi.apply(db.data, d);
        applying = false;
    };
    var resync = function() {
        if (db.insync == true || db.waitsync == true)
            return;
        detach();
        emit({ f: "request" });
        db.waitsync = true;
        if (raise_event) raise_event("resyncing");
    };
    var attach = function() {
        db.roothandlers.push(handler);
    }
    var detach = function() {
        var array=db.roothandlers;
        const index = array.indexOf(handler);
        if (index > -1) {
              array.splice(index, 1);
        }
    };
    // the truth is in the cloud
    // server:
    // * increments db rev on each change, pushes changes via delta to clients
    // * detects out-of-sync client by gapping client deltaids
    // client:
    // * applies sequential deltas from server
    // * pushes changes via sequential deltas to server
    var msghandler = function(d) {
        log("recv", d);
        if (d.f == "delta") {
            if (client) {
                if (db.insync) {
                    if (d.rev == db.rev + 1) {
                        apply(d);
                        db.rev = d.rev;
                    }
                    else {
                        db.insync=false;
                        if (!db.waitsync) {
                            console.log(socket.id, dbname, "this client is out-of-sync");
                            resync();
                        }
                    }
                } else
                    console.log(socket.id, dbname, "ignoring delta since out-of-sync");
            }
            else if (server) {
                if (db.client_write==false) {
                    console.log(socket.id, dbname, "rejecting client delta request: read-only database");
                    emit({f:"error",id:"delta_on_read_only_db", cur_rev:db.rev, req:d, cur_deltaid:deltaid});
                } else {
                     var incremental=true; //TODO
                     if (incremental) {
                         apply(d);
                     } else {
                         clientinsync=false;
                         console.log(socket.id, dbname, "rejecting request from out-of-sync client");
                         emit({f:"error",id:"bad_deltaid", cur_rev:db.rev, req:d, cur_deltaid:deltaid});
                     }
                }
            }
        }
        else if (server && d.f == "request") {
            emit({ f: "response", data: db.data, rev: db.rev });
            deltaid = 0;
            clientinsync=true;
        }
        else if (client && d.f == "response") {
            if (!db.insync && db.waitsync) {
                db.data = Maggi(d.data);
                db.rev = d.rev;
                db.insync = true;
                db.waitsync = false;
                db.sync_count++;
                deltaid = 0;
                attach();
                if (onsync) onsync();
            } else {
                console.warn(socket.id, dbname, "ignoring unrequested sync response");
            }
        }
        else if (d.f == "error") {
            if (client) {
                if (d.id == "old_rev") {
                    console.log(socket.id, dbname, "received out-of-sync notice");
                    db.insync=false;
                    resync();
                } else {
                    console.warn(socket.id, dbname, d.message);
                    detach();
                    socket.off(mk, msghandler);
                    if (raise_event) raise_event("error", d);
                }
            }
        }
    };
    if (server)
        attach();
    socket.on(mk,msghandler);
    db.insync = false; //only for client
    db.waitsync = false; //only for client
    return resync;
};

module.exports = Maggi;

