/*!
 * Maggi.js JavaScript framework
 * Thilo Maurer
 * https://github.com/thilomaurer/Maggi.js
 * LAGPL-3.0 - https://github.com/thilomaurer/Maggi.js/blob/master/LICENSE
 */

const Maggi = require('./Maggi.js');
const socketio = require('./node_modules/socket.io-client/dist/socket.io.js');

var clientdbs = {};
Maggi.db.client = function(dbreq, events, defs, options) {
    var socket = Maggi.db.client.socket;
    options = options || {};
    Object.assign(options, Maggi.db.client.default_options);
    if (socket == null) {
        var url = options.url || "";
        url += Maggi.db.ionamespace;
        socket = socketio.io(url);
        Maggi.db.client.socket = socket;
    }
    dbreq = Maggi.db.fill_dbreq(dbreq);
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

module.exports = Maggi;

