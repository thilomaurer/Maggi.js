/*!
 * Maggi.js JavaScript framework
 * Thilo Maurer
 * https://github.com/thilomaurer/Maggi.js
 * LAGPL-3.0 - https://github.com/thilomaurer/Maggi.js/blob/master/LICENSE
 */

const fs = require('fs');
const glob = require('glob');
const mkdirp = require('mkdirp');
const Maggi = require('./Maggi.js');

var write_s = {};

var writefile=function(filename,data,enc) {
	if (enc==null) enc="utf8";
	if (write_s[filename]==null) 
		write_s[filename]={filename:filename,data:data,enc:enc,saving:false,save_again:false};
	else { write_s[filename].data=data; write_s[filename].enc=enc; write_s[filename].save_again=true; }

	var save=function(x) {
		var dir=x.filename.substring(0,x.filename.lastIndexOf("/"));
		x.save_again=x.saving;
		if (x.saving) return;
		x.saving=true;
		var done=function(err) {
			x.saving=false;
			if (err) console.log(JSON.stringify(err));
			if (x.save_again) save(x);
		};
		mkdirp(dir,function(err) {
			if (err) done(err);
			else {
				fs.rename(x.filename,x.filename+".backup", err => {
					if (err) console.log(JSON.stringify(err));
					fs.writeFile(x.filename, x.data, x.enc, done);
				});
			}
		}); 
	};
	save(write_s[filename]);
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
            initialdata: dbreq.initialdata||{},
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

var clientdbs = {};
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
            dbreq = Maggi.db.fill_dbreq(dbreq);
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
                let res={f:"error",id:"missing_db_name", req:dbreq};
                emit(res);
                return;
            }
            dbreq.log = log;
            var process_request = function(db) {
                var t=dbreq.type;
				var res;
                if (t==null||t=="data") {
                    if (clientdbs.indexOf(dbname) == -1) {
                        clientdbs.push(dbname);
                        log("process_request: startsync");
                        Maggi.db.sync(socket, dbreq, db, false, null, null, server.synclog);
                        res={ f: "connected" };
                    }
                } else if (t=="req") {
                    log("command "+JSON.stringify(dbreq));
                    if (db.req) {
                        db.req(dbreq);
	                    res={f:"success", req:dbreq};
					} else {
                        res={f:"error",id:"req_field_missing", req:dbreq};
					}
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

module.exports = Maggi;

