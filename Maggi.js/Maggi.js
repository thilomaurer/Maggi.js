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

Maggi.db.load_json = function(filename, enc) {
    return new Promise((resolve,reject) => {
        fs.readFile(filename, enc, (err, db) => {
            if (err) return reject(err);
            try {
                db = JSON.parse(db);
            } catch (e) {
                reject(new Error("Unable to parse Maggi.db '" + filename + "'"));
            }
            resolve(db);
        });
    });
};

Maggi.db.load = function(filename, enc) {
    return Maggi.db.load_json(filename, enc)
        .catch(err => {
            console.error(err);
            var bfn = filename+".backup";
            console.error("Restoring from backup "+bfn);
            return new Promise((resolve,reject) => {
                fs.copyFile(bfn, filename, err => {
                    if (err) reject(err);
                    Maggi.db.load_json(bfn, enc).then(resolve).catch(reject);
                });
            });
        });
};

Maggi.db.create = function(server, dbreq, useroptions) {
    return new Promise((resolve,reject) => {
        var dbname = dbreq.name;
        dbreq.log("create");
        var options = {
            bindfs: false,
            persistant: true,
            loadexisting: true,
            initialdata: {},
            initialrev: 0,
            enc: "utf8",
            allow_create: false,
            client_write: false
        };
        for (var k in useroptions)
            options[k] = useroptions[k];

        var basename = Maggi.db.server.fulldbpath() + "/" + dbname;
        var dbjson = Maggi.db.server.dbpathname(dbname);
        var dbdir = basename + ".fs/";

        function save_fs(k, v) {
            if (v instanceof Object) {
                for (var k1 in v)
                    saveFS(k.concat(k1), v[k1]);
                return;
            }
            if (k instanceof Array) k = k.join("/");
            var fp = dbdir + k;
            writefile(fp, v, options.enc);
        };
/*
        var replacer = function(k,v) {
            if (this instanceof Object && Object.getOwnPropertyDescriptor(this,k).get === undefined) 
                return undefined;
            else
                return v;
        }
*/
        
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
            d={data:db.data,rev:db.rev,users:db.users};
            var s = JSON.stringify(db, null, '\t')+'\n';
            writefile(dbjson, s, options.enc);
        };
        function bindsave(db) {
            db.bind("set", "rev", function() { save(db) });
        };

        function engage(db) {
            if (server.dbs[dbname].state != "vive") return;
            dbreq.log("engage");
            db.roothandlers=[];
            var handler = function() {
                db.rev += 1;
                if (options.persistant)
                    save(db);
                if (options.bindfs)
                    savefs.apply(null,arguments);
                for (var i=0;i<db.roothandlers.length;i++)
                    db.roothandlers[i].apply(null,arguments);
            };
            db.data.bind("set", handler);
            db.data.bind("add", handler);
            db.data.bind("remove", handler);

            server.dbs[dbname] = db;
            resolve(db);
        };

        function initcomplete(db) {
            dbreq.log("init complete");
            if (db == null) return;
            if (server.dbs[dbname].state != "vive") return;
            db.data = Maggi(db.data);
            db.flush=function() {
                save_now(db);
            };
            var ch = options.createhook;
            if (ch) {
                dbreq.log("create hook");
                ch(server, db, options.pathmatch, function() { engage(db); });
            }
            else engage(db);
        };

        var r = function(message) {
            var msg=`create rejected: ${message}`;
            dbreq.log(msg);
            reject(new Error(msg));
        };

        if (options.persistant || options.loadexisting) {
            if (fs.existsSync(dbjson)||fs.existsSync(dbjson+".backup")) {
                if (dbreq.create !== undefined && dbreq.create==true) {
                    r("db already exists, but creation requested");
                } else {
                    dbreq.log("loading from file");
                    Maggi.db.load(dbjson, options.enc)
                        .then(initcomplete)
                        .catch(err => {
                            console.error(err);
                        });
                }
            } else {
                if (dbreq.create !== undefined && dbreq.create==false) {
                    r("database not found, creation not requested");
                } else if (options.allow_create == false) {
                    r("creation not permitted"); 
                } else {
                    dbreq.log("initializing new database");
                    var db = {
                        data: options.initialdata,
                        rev: options.initialrev
                    };
                    db.client_write=options.client_write;
                    if (dbreq.credentials != null) {
                        var username = dbreq.credentials.username;
                        db.users = {}
                        db.users[username] ={
                            role: "admin",
                            username: username,
                            password_hash: dbreq.credentials.password_hash,
                        }
                    }
                    save(db);
                    initcomplete(db);
                }
            }
        }
    });
};

Maggi.db.ionamespace = "/Maggi.db";

Maggi.db.server = function(io, options) {
    var server = {
        dbs: {},
        dbnames: [],
        io: io,
        clients: {},
        providers: [
            {
                paths: options.paths,
                allow_create: options.allow_create,
                client_write: options.client_write
            }
        ],
        log: false || options&&options.log,
        synclog: false || options&&options.synclog,
        db: function(dbreq) {
            dbreq = fill_dbreq(dbreq);
            return Maggi.db.server.vive(server, dbreq).then(db => {
                dbreq.log("provide");
                return db;
            });
        },
        list: function(g) {
            g = g || "*";
            g = Maggi.db.server.dbpathname(g);
            var basename = Maggi.db.server.fulldbpath() + "/";
            return new Promise((resolve,reject) => {
                glob(g, function (err, files) {
                    if (err)
                        reject(err);
                    else
                        resolve(files.map(f => f.substring(basename.length,f.length-".json".length)));
                });
            });
        },
    };

    io.of(Maggi.db.ionamespace).on('connection', function(socket) {
        if (server.log)
            console.log(socket.id, "connected");
        clientdbs = [];
        server.clients[socket.id] = clientdbs;
        socket.on("Maggi.db", function(dbreq) {
            var resaddr="Maggi.db." + dbreq.reqid;
            var log = msg => {
                if (server.log)
                    console.log(`${socket.id}, db ${dbname}:`,msg);
            };
            var warn = msg => {
                console.warn(`${socket.id}, db ${dbname}:`,msg);
            };
            var error = msg => {
                console.error(`${socket.id}, db ${dbname}:`,msg);
            };
            var emit = function(d) {
                log("emit", d);
                socket.emit(resaddr, d);
            };
            var dbname = dbreq.name;
            if (typeof dbname != "string" || dbname=="") {
                res={f:"error",id:"missing_db_name", req:dbreq};
                emit(res);
                return;
            }
            dbreq.log = log;
            var process_request = function(db) {
                var t=dbreq.type;
                if (t==null||t=="data") {
                    if (clientdbs.indexOf(dbname) == -1) {
                        clientdbs.push(dbname);
                        log("process_request: startsync");
                        Maggi.db.sync(socket, dbreq, db, false, null, null, server.synclog);
                        res={ f: "connected" };
                    }
                } else if (t=="req") {
                    log("command "+JSON.stringify(dbreq));
                    if (db.req)
                        db.req(dbreq);
                } else if (t=="modify_user") {
                    var newuser=dbreq.user;
                    var username=newuser.username;
                    var user=db.users[username];
                    if (user==null) {
                        res={f:"error",id:"unknown_user", req:dbreq};
                    } else {
                        var changed=false;
                        if (newuser.role!=null) {
                            user.role=newuser.role;
                            changed=true;
                        }
                        if (newuser.password_hash!=null) {
                            user.password_hash=newuser.password_hash;
                            changed=true;
                        }
                        if (changed) {
                            db.flush();
                            res={f:"success", req:dbreq};
                        }
                        else
                            res={f:"error",id:"no_changes_requested", req:dbreq};
                    }
                } else {
                    res={f:"error",id:"unknown_type", req:dbreq};
                }
                socket.emit(resaddr,res);
            };
            var reject = err => {
                error("error:" + err.message);
                emit({ f: "error",  message: err.message });
            };
            var validate_credentials = function(db) {
                if (db.users && Object.keys(db.users).length > 0) {
                    if (dbreq.credentials == undefined)
                        return Promise.reject(new Error("access denied: no credentials provided"));
                    var user = db.users[dbreq.credentials.username];
                    if (user === undefined || user.password_hash != dbreq.credentials.password_hash) {
                        var msg = `access denied for ${dbreq.credentials.username}: user not authorized`;
                        warn(msg);
                        return Promise.reject(new Error(msg));
                    }
                    log("credentials valid");
                }
                return db;
            }
            Maggi.db.server.vive(server, dbreq)
                .then(validate_credentials)
                .then(process_request)
                .catch(reject);
        });
        socket.on('disconnect', function(e) {
            if (server.log)
                console.log(socket.id, "disconnect", e);
            //TODO: cleanup?
        });
    });
    return server;
};

Maggi.db.server.path = "db";
Maggi.db.server.fulldbpath = function() {
    return process.cwd() + "/" + Maggi.db.server.path;
};
Maggi.db.server.dbpathname = function(dbname) {
    return Maggi.db.server.fulldbpath() + "/" + dbname + ".json";
};

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

var fill_dbreq = function(dbreq) {
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


var jsonpathmatch = function(base, requ) {
    var b = base.split("/");
    var r = requ.split("/");
    var match = [];
    for (var i = 0; i < b.length; i++) {
        if (b[i] == "*") match.push(r[i]);
        else if (b[i] != r[i]) return false;
    }
    return match;
};

function get_create_options(server, dbreq) {
    var path = dbreq.name;
    if (typeof path != "string") return false;
    for (var idx in server.providers) {
        var pvd = server.providers[idx];
        var paths = pvd.paths;
        if (paths instanceof Array)
            paths = paths.reduce((acc,val,idx) => {
                acc[val]=null;
                return acc;
            },{});
        for (var p in paths) {
            var match = jsonpathmatch(p, path);
            if (match) {
                var ac = pvd.allow_create;
                if (ac == null) ac = false;
                if (ac instanceof Array)
                    ac = ac.map(x=>jsonpathmatch(x,path)).findIndex(x=>(x!==false))!=-1;
                var cw = pvd.client_write;
                if (cw == null) cw = false;
                if (cw instanceof Array)
                    cw = cw.map(x=>jsonpathmatch(x,path)).findIndex(x=>(x!==false))!=-1;
                return { 
                    pathmatch: match, 
                    createhook: paths[p],
                    allow_create: ac,
                    client_write: cw
                };
            }
        }
    }
    return null;
}

Maggi.db.server.vive = function(server, dbreq) {
    var serverlog = msg => {
        if (server.log)
            console.log(`server, db ${dbreq.name}:`,msg);
    };
    if (dbreq.log === undefined) dbreq.log = serverlog;
    return new Promise((resolve,reject) => {
        var r = function(message) {
            var errmsg = `rejected: ${message}`;
            dbreq.log(errmsg);
            reject(new Error(errmsg));
        }
        var db = server.dbs[dbreq.name];
        if (db === undefined) {
            dbreq.log("vive");
            server.dbs[dbreq.name] = {state:"vive", callbacks:[]};
            db = server.dbs[dbreq.name];
            var accept = function(options) {
                dbreq.log("accept");
                var pdb = db;
                var res = Maggi.db.create(server, dbreq, options).then(db => {
                    for (var i in pdb.callbacks) {
                        var cb = pdb.callbacks[i];
                        if (cb) cb(db);
                    }
                    return db;
                }).catch(err => {
                    delete server.dbs[dbreq.name];
                    return Promise.reject(err);
                });
                resolve(res);
            };
            var options = get_create_options(server, dbreq);
            if (options)
                accept(options);
            else
                r("db not served");
        } else if (db.state == "vive") {
            dbreq.log("enqueued");
            db.callbacks.push(resolve);
        } else {
            dbreq.log("already active");
            if (dbreq.create !== undefined && dbreq.create == true)
                r("db already exists, but creation requested");
            else
                resolve(db);
        }
    });
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
        msg={ f: "delta", e: e, k: k, rev: db.rev, v: v };
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

var clientdbs = {};
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
    dbreq = fill_dbreq(dbreq);
    if (dbreq.type!="data") {
        return new Promise((resolve,reject) => {
            socket.on("Maggi.db."+dbreq.reqid,function(res) {
                if (res.f=="error")
                    reject(res);
                else
                    resolve(res);
            });
            socket.emit("Maggi.db", dbreq);
        });
    }
    if (events==null) events=[];
    if (!(events instanceof Array)) events=[events];
    events=events.filter(e => e instanceof Object);
    var dbname = dbreq.name;
    Maggi.db.client.states.add(dbname,{name:dbname,state:null});
    var raise_event=function(eventname) {
        Maggi.db.client.states[dbname].state = eventname;
        if (options.eventlog === true)
            console.log(socket.id, eventname, dbname);
        var args=[].slice.call(arguments,1);
        var d=args[0];
        if (d && d.f=="error") {
            delete clientdbs[dbname];
        }
        db.events.forEach(function(evt) {
            if (evt[eventname]) evt[eventname].apply(null,[db,...args]);
        });
        if (eventname=="ready") {
            db.events=db.events.map(evt => {
                if (evt.ready !== undefined)
                    delete evt.ready;
                return evt;
            });
        }
    }
    if (clientdbs[dbname] !== undefined) {
        var db=clientdbs[dbname];
        if (db.events===undefined) db.events=[];
        db.events.push(...events);
        var dbdata=db.data;
        if (db.insync) 
            raise_event("ready");
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

    var db = Maggi({data: null});
    db = Object.assign(db, {name: dbname, rev: 0, insync: false, sync_count: 0, events: [], roothandlers: []});
    db.events.push(...events);
    clientdbs[dbname] = db;

    var onsync = function() {
        if (db.rev == 0)
            add_unset(db.data, defs);
        var handler = function() {
            for (var i=0;i<db.roothandlers.length;i++)
                db.roothandlers[i].apply(null,arguments);
        };
        db.data.bind("set", handler);
        db.data.bind("add", handler);
        db.data.bind("remove", handler);
        raise_event("ready");
        if (db.sync_count>1)
            raise_event("resynced");
    };
    
    var response = function(d) {
        if (d.f == "connected") {
            resync();
        }
        else if (d.f == "error")
            raise_event(d.f, d);
        else
            console.error(socket.id, dbname, "unknown event",d);
    };

    var register = function() {
        socket.on("Maggi.db."+dbreq.reqid,response);
        socket.emit("Maggi.db", dbreq);
        raise_event("connecting");
    };

    var nosync = function() {
        db.insync=false;
    }


    socket.on("reconnect", register);
    var evs = ['error', 'disconnect', 'reconnect', 'reconnect_attempt', 'reconnect_error', 'reconnect_failed'];
    socket.on('disconnect', nosync);
    evs.forEach(function(v) {
        socket.on(v, function(e) {
            raise_event(v, e);
        });
    });
    var resync = Maggi.db.sync(socket, dbreq, db, true, raise_event, onsync, options && options.synclog);
    register();
    return db;
};

Maggi.db.client.states = Maggi({});

Maggi.db.client.default_options = {};

if (typeof module !== 'undefined') {
    var fs = require('fs'),
        writefile = require('./writefile.js'),
        glob = require('glob');
    module.exports = Maggi;
}
