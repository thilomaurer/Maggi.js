/*!
 * Maggi.js JavaScript framework
 * Thilo Maurer
 * https://github.com/thilomaurer/Maggi.js
 * LAGPL-3.0 - https://github.com/thilomaurer/Maggi.js/blob/master/LICENSE
 */

Maggi.id=0;

var clone=function(o) { return $.extend(true,{},o); };
var log=function(o) { if (o instanceof Object) o=clone(o); console.warn(o); };
var Object2Array=function(o) { return Object.keys(o).map(function(k) { return parseInt(k); }).sort(function(a,b) {return a-b;}).map(function(k) { return o[k]; }); };

Maggi.UI=function(dom,data,ui,parent) {
	if (!dom) return;
	var m=Maggi({data:data,ui:ui});
	m.dom=dom;
	if (parent!==null) m.parent=parent;
    Maggi.UI2(m);
    return m;
};


Maggi.UI2=function(m) {

	var makeElement=function(ns,id,tag,attr,text) {
		var el=ns?document.createElementNS(ns,tag):document.createElement(tag);
		el.id=id;
		for (var k in attr)
			el.setAttribute(k,attr[k]);
		if (text!=null) el.textContent=text;
		return el;
	};
	var installpartdom=function(dom,domNS) {
		for (var k in dom) {
		     var v=dom[k];
		     var el;
		     if (typeof(v) === 'string') el=makeElement(domNS,k,v);
		     else if (v instanceof Object) el=makeElement(domNS,k,v.tag,v.attr,v.text);
		     else { console.warn("Maggi.js: installpart: unhandled dom: ",p.dom); continue; }
		     m[k]=$(el).appendTo(m.dom);
		}
		//for (var k in p.dom)
        	//    m[k]=$('<'+p.dom[k]+'>',{id:k}).appendTo(m.dom);
	}

    var installpart=function(p) {
        if (p==null) return null;
        //console.log(p.name);
        m.dom.addClass(p.partclass);
        //install members
        for (var mbr in p.members)
            if (m.ui[mbr]===undefined) 
                m.ui.add(mbr,p.members[mbr]);
        //install parts
        var deinstallParts={};
        if (typeof p.parts === "string") p.parts=[p.parts];
        for (var k in p.parts) {
            var v=p.parts[k];
            deinstallParts[v]=installpart(Maggi.UI.parts[v]);
        }
        installpartdom(p.dom,p.domNS);
        //run builder
        var backbuilder=null;
        if (p.builder) backbuilder=p.builder(m);
        //install bindings
        var deinstallBindings=installPartBindings(p,m);
        //return backbuilder
        return function() {
            if (deinstallBindings) { deinstallBindings(); deinstallBindings=null; }
            if (backbuilder) { backbuilder(); backbuilder=null; }
            //remove dom
            for (var k in p.dom)
                m[k].remove();
            for (var k in p.parts) {
                var v=p.parts[k];
                var f=deinstallParts[v];
                if (f) f();
            }
            m.dom.removeClass(p.partclass);
        };
    };

    var build=function() {
        if (m.backbuild) m.backbuild();
        if (m.ui==null) return;
        //inflate ui shortcuts
    	if (typeof m.ui === "function") {m.ui=m.ui(); return;}
    	if (typeof m.ui === "string") {m.ui={parts:[m.ui]}; return;}
    	//console.log(m.dom);
        var deinstallpart=installpart(m.ui);
    	//console.log(m.dom);
        m.backbuild=function() {
    	    if (deinstallpart) deinstallpart();
    	};
    };
    m.bind("set","ui",build);
    //console.log(m);
	build();
};

var installBindings=function(handlers) {
	$.each(handlers,function(idx,v) {
		var o=v[0];
		var e=v[1];
		var k=v[2];
		var f=v[3];
		if (o!=null) {
			o.bind(e,k,f);
			f(k,o[k]);
		} else console.log("bind to null ignored");
	});
	return function() {
		$.each(handlers,function(idx,v) {
			var o=v[0];
			var e=v[1];
			var k=v[2];
			var f=v[3];
			if (o!=null) {
				o.unbind(e,f); //TODO: (e,k,f);
			} else console.log("unbind from null ignored");
		});
	};
};

var installPartBindings=function(p,m) {
    var b=p.bindings;
    if (b==null) return null;
    var x=[];
	$.each(b,function(idx,v) {
	    var l=v.length;
	    if (v instanceof Object) l=Object.keys(v).length;
	    if (l!=3) return;
	    var e=v[0];
	    var f=v[2];
	    var o=m;
	    var keys=v[1];
	    var k;
	    if (keys instanceof Object) {
	        k=[];
	        for (var ki in keys)
	            k.push(keys[ki].split("."));
	    } else k=[keys.split(".")];
	    //console.log("install",k); 
	    //if (k.length>1) o=o[k.shift()]; 
		if (typeof f === "string") f=p[f];
		if (typeof f !== "function") console.log("not a function:",f,m);
		if (o!=null) {
		    var f2=function(k,v,ov,e) {
		        if (Maggi.UI.log==true) console.log("Maggi.UI.js: trigger "+e+" for ",k);
			    f(m,k,v,ov,e);
			};
			k=k[0]; //TODO: fix : use all keys
			x.push({o:o,e:e,k:k,f:f2});
			//console.log(e,k);
			o.bind(e,k,f2);
			if (e=="set") {
			    //k=k[0]; //install-trigger with first key only
    			for (var i=0;i<k.length;i++){
    			    o=o[k[i]];
    			    if (o==null) return;
    			}
    			f2(k,o);
			}
		} else console.log("bind to null ignored");
	});
	return function() {
	    $.each(x,function(idx,v) {
			v.o.unbind(v.e,v.f);
	    });
	};
};


Array_unique = function (a) {
    var r = new Array();
    o:for(var i = 0, n = a.length; i < n; i++)
    {
        for(var x = 0, y = r.length; x < y; x++)
        {
            if(r[x]==a[i])
            {
                continue o;
            }
        }
        r[r.length] = a[i];
    }
    return r;
};



Maggi.UI.parts={};

Maggi.UI.parts.input={
    name:"input",
    partclass:"input cols",
    members:{
        autosize:true,
        prefix:"",
        postfix:"",
        postfixui:null,
        kind:null,
        placeholder:"",
        onReturnKey:null,
        focus:false,
        selectOnFocus:false,
        alerting:false,
    },
    description:"The Part Input is so great because...",
    caption:"The Part Input",
    member_description:{
    	autosize:{
    		name:"autosize",
    		type:"boolean",
    		caption:"Autosize Length",
    		description:"Have the width (number of characters) of the input matching the length of its content, i.e. the attribute 'size' of the input HTMLElement is kept in sync with the content-length.",
    		example:"true"
    	},
    	placeholder:{
    		caption:"Placeholder",
    		name:"placeholder",
    		type:"string",
    		description: "String to show as a placeholder in the input when it is empty edit",
    		example:'placeholder:"username"'
    	},
    	kind:{
    		caption:"Input Kind",
    		name:"kind",
    		type:"string",
    		description: "The kind of input is set to the type attribute of the input element. Common values are text, number, email, etc... See current HTML standard for a full list. ",
    		example:'kind:"email"'
    	},
    	onReturnKey:{
    		caption:"Return Key Action",
    		name:"onReturnKey",
    		type:"function(value)",
    		description: "The function called with the current value of the input when the 'Return' key is being input by the user.",
    		example:"function(v) { alert(v); }"
    	},
        prefix:{
    		caption:"Prefix Text",
    		name:"prefix",
    		type:"string",
    		description: "The text prefixing the editable text.",
    		example:"value:"
        },
        postfix:{
    		caption:"Postfix Text",
    		name:"postfix",
    		type:"string",
    		description: "The text postfixing the editable text.",
    		example:"Dollar"
        },
        postfixui:{
    		caption:"Postfix UI",
    		name:"postfixui",
    		type:"maggi.UI object",
    		description: "The UI postfixing the editable text. Overrides postfix.",
    		example:'{parts:"label",label:"Dollar"}'
        },
        focus:{
    		caption:"Focus State",
    		name:"focus",
    		type:"boolean",
    		description: "Determines the focus state of the element.",
    		example:true
        },
        selectOnFocus:{
    		caption:"Select on Focus",
    		name:"selectOnFocus",
    		type:"boolean",
    		description: "When true, all content of the input is selected on receiving focus.",
    		example:true
        }
    },
    parts:"common",
    bindings:{
        post: ["set","ui.postfix",function(m,k,v) {m.postfix.text(v);if (v=="") m.postfix.addClass("invisible"); else m.postfix.removeClass("invisible");}],
        postui: ["set","ui.postfixui",function(m,k,v) {
            if (v==null) return;
            var x=Maggi({data:{},ui:v});
            x.dom=m.postfix;
            x.bind("set","ui",function(k,v) {m.ui.postfixui=v;})
            Maggi.UI2(x); 
        }],
        pre:  ["set","ui.prefix" ,function(m,k,v) {m.prefix.text(v); if (v=="") m.prefix.addClass("invisible"); else m.prefix.removeClass("invisible");}],
        ph:   ["set","ui.placeholder" ,function(m,k,v) {m.i.attr("placeholder",v);}],
        k:    ["set","ui.kind" ,function(m,k,v) {m.i.attr("type",v);}],
        e:    ["set","data","datachange"],
        eas:  ["set","data","as"],
        as:   ["set","autosize","as"],
        f:    ["set","ui.focus",function(m,k,v) { if (v===true) m.i.focus(); }],
        g:    ["set","ui.enabled",function(m,k,v) { var r="readonly"; if (v===false) m.i.attr(r,r); else m.i.removeAttr(r); }],
        alerting:["set","ui.alerting",function(m,k,v) { if (v===true) m.dom.addClass("alerting"); else m.dom.removeClass("alerting"); }]
    },
    dom:{prefix:"div",midfix:"div",postfix:"div",i:"input"},
    as:function(m) {
	var i=m.i;
	if (m.ui.autosize) {
		var l=0;
		if (m.data!==null) l=m.data.toString().length;
		if (m.ui.placeholder!==null) if (l<m.ui.placeholder.length) l=m.ui.placeholder.length;
		if (l===0) i.addClass("empty"); else i.removeClass("empty");
		if (l===0) l=1;
		i.attr("size",l);
	} else i.removeAttr("size");	
    },
    datachange: function(m) {
	var i=m.i;
	if (m.ui.kind=="file") return;
	var newvalue=(m.data!=null)&&(m.data.toString());
	if (i[0].value!=newvalue) i[0].value=newvalue;
    },  
    builder(m) {
        var i=m.i.appendTo(m.midfix);
    	i.on("input",function(event) {
    	    var v=this.value;
    	    if (m.ui.kind=="number"&v!="") v=parseFloat(v);
    		m.data=v;
    		event.stopPropagation();
    	}).on("keypress",function(event) { 
    		if (event.keyCode == '13') { if (m.ui.onReturnKey) m.ui.onReturnKey(this.value); }
    		event.stopPropagation();
    	}).keydown(function(event) {
    		event.stopPropagation();
    	}).focus(function() {
    		m.dom.addClass('focused');
    		m.ui.focus=true;
    		if (m.ui.selectOnFocus===true) m.i.select();
    	}).blur(function() {
    		m.dom.removeClass('focused');
    		m.ui.focus=false;
    	});
	var onClick=function(event) {
		m.i.focus();
		if (event!=null) event.stopPropagation();
	};
    	m.dom.on("click",onClick);
    	return function() {
    	    m.dom.off("click",onClick);
    	};
    }
};

Maggi.UI.parts.common={
    name:"common",
    parts:["enabled","class","visible","onClick"]
};

Maggi.UI.parts.children={
    name:"children",
    partclass:"children",
    parts:"common",
    members:{children:{},childdefault:null,order:null,domNS:null,domtag:"div"},
    order:function(m) {
        var o=m.ui.order;
        if (o) return Object2Array(o);
        o=Object.keys(m.ui.children);
	function onlyUnique(value, index, self) {
	    return self.indexOf(value) === index;
	}
        if (m.ui.childdefault) {
            o=Object.keys(m.data).concat(o).filter(onlyUnique);
        }
        return o;
    },
    makeElement:function(m,id) {
	var tag=m.ui.domtag;
	var ns=m.ui.domNS;
        var el=ns?document.createElementNS(ns,tag):document.createElement(tag);
        el.id=id;
        return el;
    },
    place:function(m,k) {
        var i=m.inner[k];
        if (i==null) return;
        var w=i.dom;
        var o=Maggi.UI.parts.children.order(m);
        var idx=o.indexOf(k.toString());
        if (idx==-1) return;
        while (idx>0) {
            idx--;
            var beforek=o[idx];
            var d=m.inner[beforek];
            if (d&&d.dom) { w.insertAfter(d.dom); return; }
        }
        w.prependTo(m.dom); 
    },
    add:function(m,k) {
        //console.log("add",k);
        if (m.data==null) return; 
        if (m.ui.children==null) return;
        if (k instanceof Array) k=k[k.length-1];
        //console.log(m.inner);
        if (m.inner[k]==null) {
            var z={fromdefault:false,dom:$(Maggi.UI.parts.children.makeElement(m,k))};
            var ui=m.ui.children[k];
            if (ui==null&&m.ui.childdefault) {
		var cd=m.ui.childdefault;
		ui=(cd instanceof Function)?function() { return cd(m,k);}:cd;
		//ui=cd;
	        z.fromdefault=m.ui.children;
	    }
            //console.log(k,ui,m.ui);
            z.m=Maggi({data:m.data[k],ui:ui});
            z.m.parent=m;
            z.m.dom=z.dom;
            z.m.bind("set","data",function(key,v) {
                m.data[k]=v;
            });
            z.m.bind("set","ui",function(key,v) {
                m.ui.children.add(k,v);
            });
            m.inner[k]=z;
            Maggi.UI.parts.children.place(m,k);
            //console.log("z.m",z.m);
            Maggi.UI2(z.m);
        } else {
            m.inner[k].m.data=m.data[k];
            m.inner[k].m.ui=m.ui.children[k];
            Maggi.UI.parts.children.place(m,k);
        }
    },
    remove:function(m,k) {
        //console.log("remove",k);
        if (k instanceof Array) k=k[k.length-1];
        var z=m.inner[k];
        if (z==null) return;
        m.inner[k].dom.remove();
        if (z.m.backbuild) z.m.backbuild();
        if (m.ui&&(z.fromdefault===m.ui.children)) m.ui.children.remove(k);
        delete m.inner[k];
    },
    placeall:function(m) {
        //console.log("placeall",m);
        for (var k in m.inner) {
            m.inner[k].dom.detach();
        }
        for (var k in m.ui.order) {
            Maggi.UI.parts.children.place(m,m.ui.order[k]);
        }
    }, 
    removeall:function(m) {
        //console.log("removeall",m);
        for (var k in m.inner)
            Maggi.UI.parts.children.remove(m,k);
    },
    remake:function(m,k,v,ov) {
        //console.log("remake",k,v,ov);
        var add=function(k) { Maggi.UI.parts.children.add(m,k); };
        var remove=function(k) { Maggi.UI.parts.children.remove(m,k); };
        if (ov!=null) $.each(ov,remove);
        if (v!=null) $.each(v,add);
        $.each(m.ui.children,add);
    },
    builder(m) {
        m.inner={};
        return function() {
            Maggi.UI.parts.children.removeall(m);   
        }
    },
    bindings:{
        a:["set","ui.childdefault",function(m,k,v) {
            $.each(m.inner,function(k,z) {
                if (z.fromdefault!=false)
                    if (v===null)
                        Maggi.UI.parts.children.remove(m,k);
                    else
                        z.m.ui=v;
            });
        }],
        aa:["set","ui.order","placeall"],
        b:["set"   ,"ui.children.*",function(m,k,v) { m.inner[k[2]].m.ui=v;}],
        c:["add"   ,"ui.children.*","add"],
        d:["remove","ui.children.*","remove"],
        setdata:["set"   ,"data.*"  ,function(m,k,v) { var k=k[1]; if (m.ui.children[k]!==undefined) m.inner[k].m.data=v; }],
        f:["add"   ,"data.*"  ,"add"],
        g:["remove","data.*"  ,"remove"],
        h:["set","ui.children","remake"],
        j:["set","data","remake"],
    }
};

Maggi.UI.parts.enabled={
    name:"enabled",
    members:{enabled:true},
    bindings:{
        e: ["set","ui.enabled",function(m,k,v,ov,e) {
            var cls="disabled";
            if (v===false) m.dom.addClass(cls); else m.dom.removeClass(cls); 
        }]
    }
};

Maggi.UI.parts.class={
    name:"class",
    members:{class:""},
    bindings:{
        e: ["set","ui.class",function(m,k,v,ov,e) {
            m.dom.removeClass(ov); m.dom.addClass(v);
        }]
    },
    builder(m) {
        var oldui=m.ui;
        return function() {
            m.dom.removeClass(oldui.class);
        };
    }
};

Maggi.UI.parts.visible={
    name:"visible",
    members:{visible:true},
    bindings:{
        e: ["set","ui.visible",function(m,k,v,ov,e) {
            var cls="invisible";
            if (v===false) m.dom.addClass(cls); else m.dom.removeClass(cls); 
        }]
    }
};

Maggi.UI.parts.text={
    name:"text",
    partclass:"text",
    members:{format:null,map:null},
    parts:"common",
    bindings:{
        e:["set","data","update"],
        g:["set","ui.format","update"]
    },
    update: function(m) {
        var s="(null)";
        var d=m.data;
        var map=m.ui.map;
        var fmt=m.ui.format;
        if (map) {
            if (map instanceof Function)
                d=map(d);
            else
                d=map[d];
        }
        if (d!=null) { 
            if (fmt!=null)
                s=sprintf(fmt,d);
            else
                s=d.toString();
        }
        m.dom.text(s);
    },
    builder(m) {
	return function() { m.dom.empty() };
    }
};

Maggi.UI.parts.onClick={
    name:"onClick",
    members:{onClick:null,click:null},
    builder(m) {
    	var onClick=function(e) {
    	    m.ui.click++;
    	    /*
    	    var MaggiUIPATH=function(m,p) {
    	        console.log(m,p); 
    	        if (p.length==1) {
    	            var k=p[0];
    	            var f=m[k];
    	            return f();
    	        }
    	        var k=p.shift();
    	        if (k=="<") MaggiUIPATH(m.parent,p)
    	        else
    	            MaggiUIPATH(m.inner[k].m,p);
    	    }
    	    */
    	    var ui=m.ui;
    	    var handled=(ui.onClick!==null)&&(ui.enabled!==false);
    	    if (!handled) return true;
    	    if (typeof ui.onClick === "function")
    	        ui.onClick.call(m.parent.data,m);
    	    /*
    	    if (typeof ui.onClick === "string") {
    	        var a=ui.onClick.split(".");
    	        MaggiUIPATH(m,a);
    	    }
    	    */
    	    e.stopPropagation();
    	    return false;
    	};
        m.dom.on("click",onClick);
    	return function() {
    	        m.dom.off("click",onClick);
    	};
    }
};

Maggi.UI.parts.label={
    name:"label",
    partclass:"label",
    members:{label:""},
    parts:"common",
    bindings:{
        e: ["set","ui.label",function(m,k,v,ov,e) {
            m.dom.text(v);
        }]
    },
};

Maggi.UI.parts.image={
    name:"image",
    partclass:"image",
    members:{urls:null},
    parts:"common",
    dom:{img:"img"},
    bindings:{
        f:["set","ui.urls","update"],
        g:["set","data","update"],
    },
    update: function(m) {
        var url=m.data;
        if (m.ui.urls!=null) url=m.ui.urls[url];
        m.img.attr("src",url);
    }
};

Maggi.UI.parts.link={
    name:"link",
    partclass:"link",
    members:{label:"",target:null},
    parts:"common",
    dom:{a:"a"},
    bindings:{
        f:["set","ui.label",function(m) {m.a.text(m.ui.label);}],
        g:["set","ui.target",function(m) {m.a.attr("target",m.ui.target);}],
        e:["set","data",function(m) {m.a.attr("href",m.data);}],
    }
};

Maggi.UI.parts.checkbox={
    name:"checkbox",
    partclass:"checkbox",
    members:{label:"",labelposition:"before"},
    dom:{label:"label",input:"input",toggle:"label"},
    parts:"common",
    bindings:{
        f:["set","ui.label",function(m) { m.label.text(m.ui.label);}],
        e:["set","data",function(m) { m.input[0].checked=m.data; }],
        g:["set","ui.click",function(m,k,v) { m.data=!m.data; }],
    },
    counter:0,
    builder(m) {
        var name="MaggiUICheckbox"+Maggi.UI.parts.checkbox.counter.toString(); Maggi.UI.parts.checkbox.counter++;
        var id=name+"_id";
        m.label.attr("for",id);
        m.input.attr("name",name);
        m.input.attr("id",id);
        m.toggle.attr("id","toggle");
        m.input.attr("type","checkbox");
        if (m.ui.labelposition=="after") m.label.appendTo(m.dom);
        var c=function() { m.data=this.checked; }
        var s=function(e) { e.stopPropagation(); }
        m.input.on("change",c);
        m.input.on("click",s);
        m.label.on("click",s);
        return function() {
            m.input.off("change",c);
            m.input.off("click",s);
            m.label.off("click",s);
        }
    } 
};

Maggi.UI.parts.function={
    name:"function",
    members:{label:null, visible:false},
    parts:"common",
    bindings:{
        f:["set","ui.label",function(m) {m.dom.text(m.ui.label);}],
        e:["set","data",function(m) { m.ui.onClick=m.data; m.ui.visible=(m.data!=null); }]
    }
};

Maggi.UI.parts.select={
    name:"select",
    partclass:"select",
    members:{
        choices:{}
    },
    parts:"common",
    builder(m) {
            m.chld={};
    },
    bindings:{
        e:["set","ui.choices",function(m,k,v) {
            var name="MaggiUISelect"+Maggi.UI.parts.select.counter.toString(); Maggi.UI.parts.select.counter++;
            m.dom.empty();
            m.dom.on("click",function(event) { event.stopPropagation(); });
            $.each(m.ui.choices,function(key,value) {
                var id=name+"_"+key.toString();
                m.chld[key]=$("<input>",{name:name,id:id,value:key,type:"radio",enabled:m.ui.enabled}).appendTo(m.dom).change(function() {
                    if (this.checked) m.data=key;
                });
                var text=value.label;
                if (text==null) text=value;
                $("<label>",{for:id,text:text}).appendTo(m.dom);
            }); 
            var v=m.data;
            if (m.chld[v]) m.chld[v][0].checked=true;
        }],
        d:["set","data",function(m,k,v,oldv) { 
            if (m.chld[oldv]) m.chld[oldv][0].checked=false;
            if (m.chld[v]) m.chld[v][0].checked=true;
        }],
        g:["set","ui.enabled",function(m,k,v,oldv) { 
	    Object.keys(m.chld).forEach(key => m.chld[key].prop('disabled', !v));
        }],
    },
    counter:0
};

Maggi.UI.parts.childselect={
    name:"childselect",
    partclass:"childselect",
    members:{userselect:true,multiselect:false,selected:null},
    parts:"children",
    add:function(m,k) {
        if (m.ui.userselect===false) return;
        if (k instanceof Array) k=k[k.length-1];
        var z=m.inner[k];
        if (z==null) return;
        m.inner[k].m.dom.on("click",function(event) { m.ui.selected=k; event.stopPropagation(); });
        m.inner[k].m.dom.addClass("selectable");
    },
    remove:function(m,k) {
        if (m.ui.userselect===false) return;
        if (k instanceof Array) k=k[k.length-1];
        var z=m.inner[k];
        if (z==null) return;
        m.inner[k].m.dom.removeClass("selectable");
    },
    bindings:{
        e:["set","ui.children",function(m,k,v,ov,e) {
            for (var k in m.inner) Maggi.UI.parts.childselect.add(m,k);
            var v=m.ui.selected;
            if (m.inner[v]) m.inner[v].m.dom.addClass("selected");
        }],
        f:["set","data",function(m,k,v,ov,e) {
            var v=m.ui.selected;
            if (m.inner[v]) m.inner[v].m.dom.addClass("selected");
        }],
        h:["add","ui.children.*","add"],
        r:["remove","ui.children.*","remove"],
        s:["set","ui.selected",function(m,k,v,ov,e) {
            if (m.inner[ov]) m.inner[ov].m.dom.removeClass("selected");
            if (m.inner[v]) m.inner[v].m.dom.addClass("selected");
        }]
    }
};

Maggi.UI.parts.childswitcher={
    name:"childswitcher",
    partclass:"childswitcher",
    members:{
        choices:{},
        selected:null,
        wrapperdata:{selector:null},
        wrapperchildren:{
            selector:{parts:"select",choices:null},
            container:{}
        },
        wrapped:"container"
    },
    parts:["domwrap2","children"],
    bindings:{
        0:["set","ui.selected",function(m,k,v,ov) {
            m.ui.wrapperdata.selector=v; 
            if (m.inner[v]) m.inner[v].m.dom.addClass("selected");
            if (m.inner[ov]) m.inner[ov].m.dom.removeClass("selected");
        }],
        1:["set","ui.wrapperdata.selector",function(m,k,v) {m.ui.selected=v;}],
        2:["set","ui.choices",function(m,k,v) {m.domwrap2.ui.children.selector.choices=v;}],
    }
};

Maggi.UI.parts.wrap={
    name:"wrap",
    members:{
        innerui:null,
        data:undefined
    },
    bindings:{
        d:["set","data",function(m,k,v) {m.i.data=(m.ui.data===undefined)?m.data:m.ui.data;}],
        e:["set","ui.data",function(m,k,v) {m.i.data=(m.ui.data===undefined)?m.data:m.ui.data;}],
        f:["add","ui.data",function(m,k,v) {m.i.data=(m.ui.data===undefined)?m.data:m.ui.data;}],
        g:["remove","ui.data",function(m,k,v) {m.i.data=(m.ui.data===undefined)?m.data:m.ui.data;}],
        h:["set","ui.innerui",function(m,k,v) {m.i.ui=v;}]
    },
    builder(m) {
        var innerdata=(m.ui.data===undefined)?m.data:m.ui.data;
        var x=Maggi({data:innerdata,ui:m.ui.innerui});
        x.dom=m.dom;
        x.bind("set","ui",function(k,v) {m.ui.innerui=v;});
        Maggi.UI2(x);        
        m.i=x;
        return m.i.backbuild;
    }
};

Maggi.UI.parts.domwrap={
    name:"domwrap",
    partclass:"domwrap",
    builder(m) {
        m.wrap=m.dom;
        m.dom=$("<div>").appendTo(m.wrap);
        return function() {
            m.dom.remove();
        };        
    }
};

Maggi.UI.parts.p={
    name:"domwrap",
    builder(m) {
        //make previous dom to inner-dom
        m.wrapped=m.dom;
        m.dom=$("<div>").insertAfter(m.dom);
        m.wrapped.appendTo(m.dom);
        return function() {
            m.dom.remove();
        };
    }
};

Maggi.UI.parts.domwrap2={
    name:"domwrap2",
    partclass:"wrap",
    members: {
        wrapperdata:{},
        wrapperchildren:{},
        wrapperclass:null,
        wrapped:"data"
    },
    builder(m) {
        m.wrap=m.dom;
        var wrapui={
            parts:"children",
            class:m.ui.wrapperclass,
            children:m.ui.wrapperchildren
        };
        /*
        var x=Maggi({data:m.ui.wrapperdata,ui:wrapui});
        x.dom=m.wrap;
        x.bind("set","ui.children",function(k,v) {m.ui.wrapperchildren=v;})
        Maggi.UI2(x); 
        var inner=x;
        */
        var inner=Maggi.UI(m.wrap,m.ui.wrapperdata,wrapui);
        if (inner.ui.children[m.ui.wrapped]==null)
            inner.ui.children.add(m.ui.wrapped,{});
        m.domwrap2=inner;
        m.dom=inner.inner[m.ui.wrapped].dom;
        return function() {
            m.dom=m.wrap;
            //m.domwrap2=null;
            inner.backbuild();
        };
    }
};

Maggi.UI.parts.overlay={
    name:"overlay",
    parts:["domwrap","switchable"],
    members:{
        toggler:null,
        togglerselect:true,
        switchstate:false,
        switchclass:{false:"invisible"}
    },
    bindings:{
        f:["set","ui.switchstate",function(m,k,v,ov) {
            if (v) 
                m.overlayeddom.addClass("overlayed allanimate");
            else
                m.overlayeddom.removeClass("overlayed");        }]
    },
    builder(m) {
        //console.log("o",stacktrace());
        m.wrap.addClass("invisible");
        m.overlayeddom=$("body");
        m.dom.insertAfter(m.overlayeddom).addClass("overlay visibilityanimate mui");
        m.dom=$("<div>",{class:"popup"}).appendTo(m.dom);
        return function() {
            //console.log("r",stacktrace())
            m.dom.remove();
        };
    }
};

Maggi.UI.parts.switchable={
    name:"switchable",
    members:{
        toggler:null,
        togglerselect:true,
        switchstate:false, 
        switchclass:"active"
    },
    bindings:{
        e:["set","ui.toggler",function(m,k,v,ov) {
            if (m.parent==null) return;
            var st=m.parent.inner[v];
            if (st==null) { console.log("switch toggler unavailable:",v);return;}
            m.togglerElement=st.m.dom;
            m.togglerElement.on("click",function(e) { m.ui.toggle(); return false; });
        }],
        f:["set","ui.switchstate",function(m,k,v,ov) {
            var action={true:"addClass",false:"removeClass"}[v];
            var sc=m.ui.switchclass;
            if (sc instanceof Object) {
                //console.log(m.switchable_dom);
                m.switchable_dom.removeClass(sc[ov]);
                m.switchable_dom.addClass(sc[v]);
                //console.log(m.switchable_dom);
            } else {
                m.switchable_dom[action](sc);
            }
            if (m.ui.togglerselect&&m.togglerElement) 
                m.togglerElement[action]("selected");
        }]
    },
    builder(m) {
        m.switchable_dom=m.dom;
        m.ui.toggle=function(mm,kk,vv) {
            //console.log(stacktrace());
            m.ui.switchstate=!m.ui.switchstate;
        };
    }
};

Maggi.UI.parts.popup={
	name:"popup",
	parts:["switchable","domwrap"],
	partclass:"popup scroll visibilityanimate",
	members:{
		switchstate:false, 
		switchclass:{false:"invisible"}
	},
	bindings:{
		e:["set","ui.toggler",function(m,k,v,ov) {
			if (m.togglerElement) 
				m.observer.observe(m.togglerElement[0], { childList:true });
		}],
		s:["set","ui.switchstate","onswitchstate"]
	},
	onswitchstate:function(m) {
		if (m.ui.switchstate==true) {
			Maggi.UI.parts.popup.place(m);
			m.popupdom.focus();
		}
	},
	place:function(m) {
		var getInnerClientRect = function(dom) {
			var outer=dom[0].getBoundingClientRect();
			var pad = function(dom,dir) {
				return parseInt(dom.css("padding-"+dir).replace("px",""));
			};
			var left=outer.left+pad(dom,"left");
			var top=outer.top+pad(dom,"top");
			var bottom=outer.bottom-pad(dom,"bottom");
			var right=outer.right-pad(dom,"right");
			top=top+window.scrollY;
			bottom=bottom+window.scrollY;
			left=left+window.scrollX;
			right=right+window.scrollX;
			return {left:left,right:right,top:top,bottom:bottom};
		};
		m.deco.css("margin-left",0);
		var togglerElement=m.togglerElement;
		if (togglerElement===undefined) return;
		var dom=m.popupdom;
		var spacing=16;
		var pt=togglerElement.offset();
		var rect=getInnerClientRect(togglerElement);
		dom.css("left",0);
		var wh=dom.width()/2+spacing;

		var attach={x:(rect.left+rect.right)/2,y:rect.bottom};
		var overlap=attach.x+wh-$('body').width();
		var left=attach.x-wh;
		if (overlap>0) left=left-overlap;
		if (left<0) left=0;

		dom.css("top",attach.y);
		dom.css("left",left);
		if (attach.y+dom.height()+2*spacing-$('body').height()>0)
			dom.css("bottom",0);
		var ml=attach.x-left-2*spacing;
		var mlmax=2*(wh-spacing)-2*spacing-8;
		var mlmin=8;
		if (ml>mlmax) ml=mlmax;
		if (ml<mlmin) ml=mlmin;
		m.deco.css("margin-left",ml);
	},
	builder(m) {
		m.popupdom=m.wrap;
		var keyup=function (e) { if (e.keyCode==27) m.ui.switchstate=false; };
		m.popupdom.on("keyup", keyup);
		m.deco=$("<div>").prependTo(m.wrap);
		m.deco2=$("<div>").appendTo(m.deco);
		m.deco.addClass("popup-triangle-wrapper");
		m.deco2.addClass("popup-triangle-inner");
		var place=function() { if (m.ui.switchstate==true) Maggi.UI.parts.popup.place(m); };
		m.observer = new MutationObserver(place);
		m.observer.observe(m.dom[0], { childList:true, subtree:true, attributes:true, characterData:true});
		$(window).resize(place);
		return function() {
			m.popupdom.off("keyup",keyup);
		}
	}
};

Maggi.UI.parts.actionbar={
    name:"actionbar",
    partclass:"actionbar",
    members:{
        left:null,
        center:null,
        right:null,
        inner:null
    },
    builder(m) {
        m.i=Maggi.UI(m.dom,{bar:{left:{},center:{},right:{}},
            inner:null
        },{
            parts:"children",
            class:"rows",
            children:{
                bar:{
                    parts:"children",
                    class:"cols",
                    children:{
                        left:null,
                        center:null,
                        right:null
                    }
                },
                inner:null
            }
        },m);
	m.i.data.bind("set","inner",function(k,v,ov) {
		if (m.ui.data===undefined)
			m.data=v;
		else
			m.ui.data=v;
	});
        return m.i.backbuild;
    },
    bindings: {
        a:["set","data",function(m,k,v) {m.i.data.inner=v;}],
        b:["set","ui.data",function(m,k,v) {m.i.data.inner=v;}],
        c:["add","ui.data",function(m,k,v) {m.i.data.inner=v;}],
        e:["set","ui.left",function(m,k,v) {m.i.ui.children.bar.children.left=v;}],
        f:["set","ui.right",function(m,k,v) {m.i.ui.children.bar.children.right=v;}],
        g:["set","ui.center",function(m,k,v) {m.i.ui.children.bar.children.center=v;}],
        h:["set","ui.inner",function(m,k,v) {m.i.ui.children.inner=v;}],
    }
};

Maggi.UI.parts.clone={
    name:"clone",
    members:{children:{}},
    builder(m) {
        var ui={parts:"children",children:{}};
        m.i=Maggi.UI(m.dom,{},ui);
        return m.i.backbuild;
    },
    bindings:{
        0:["set","ui.children",function(m,k,v,ov) {
            for (var k in ov) m.i.data.remove(k,m.data);
            for (var k in v) m.i.data.add(k,m.data);
            m.i.ui.children=v;
        }],
        1:["set","data",function(m,k,v) {
            for (var k in m.ui.children) m.i.data[k]=m.data;
        }]
    }
};

Maggi.UI.parts.cycle={
    name:"cycle",
    members:{cycle:0,cyclelength:1},
    cyclewrap:function(m) {
            m.ui.cycle=m.ui.cycle % m.ui.cyclelength;
    },
    bindings:{
        0:["set","ui.cycle","cyclewrap"],
        1:["set","ui.cyclelength","cyclewrap"],
    },
    builder(m) {
        var a=function(event) {
            m.ui.cycle=(m.ui.cycle+1) % m.ui.cyclelength;
            return false;
        };
        m.dom.on("click",a);
        return function() {
            m.dom.off("click",a);
        }
    }
};

Maggi.UI.parts.cyclestate={
    name:"cyclestate",
    parts:"cycle",
    members:{state:"",states:{0:""}},
    builder(m) {
    },
    bindings:{
        0:["set","ui.states",function(m,k,v) {
            m.ui.cyclelength=Object.keys(v).length;
        }],
        1:["set","ui.state",function(m,k,v) {
            var o=Object2Array(m.ui.states);
            m.ui.cycle=o.indexOf(v);
        }],
        2:["set","ui.cycle",function(m,k,v) {
            var o=Object2Array(m.ui.states);
            m.ui.state=o[v];
        }]
    }
};

Maggi.UI.parts.action={
    parts:"label",
    partclass:"hoverhighlight action",
    members:{
        onClick:function(m) {
            m.dom.addClass("actioned");
            setTimeout(function() {
                m.dom.removeClass("actioned");
            },100);
        }
    }
};

Maggi.UI.parts.labelwrap={
    parts:"domwrap2",
    members:{
        label:"",
        wrapperchildren:{
            label:{parts:"label",label:""}
        }
    },
    bindings:{
        0:["set","ui.label",function(m,k,v) { m.ui.wrapperchildren.label.label=v;}]
    }
};

Maggi.UI.parts.labeledlist={
    name:"labeledlist",
	parts:["domwrap2","children"],
	partclass:"labeledlist",
	members:{
	    label:null,
        wrapperchildren:{
            label:{parts:"label",class:"listlabel"}
        },
        wrapperclass:"settings",
	    class:"simplelist",
	},
	builder(m) { 
        var t=m.ui.label;
        if (t==null) t=m.dom.parent().attr("id");
        m.ui.wrapperchildren.label.label=t;
	}
};


Maggi.UI.parts.debug={
    name:"debug",
    partclass:"debug",
    dom:{inspector:"dom"},
    builder(m) {
        
        
        
        var text_ui=function() { return {
                        parts:["labelwrap","text"],
                        wrapperclass:"member",
                	    builder(m) { 
                	        var t=m.dom.parent().attr("id");
                	        m.ui.wrapperchildren.label.label=t;
                	    }
                    }};
        var object_ui={
            parts:["labelwrap"],
            wrapperclass:"member",
            builder(m) {
    	        var t=m.dom.parent().attr("id");
    	        m.ui.wrapperchildren.label.label=t;
                var ui={
                    parts:"children",children:{}
                };
                for (var k in m.data) {
                    var t=typeof(m.data[k]);
                    console.log(k,t);
                    if (t==="object")
                        ui.children[k]=object_ui;
                    if (t==="string")
                        ui.children[k]=text_ui;
                }
                Maggi.UI(m.dom,m.data,ui);
            }
        };
        Maggi.UI(m.inspector,m,{parts:"children",children:{data:object_ui,ui:object_ui}});
    }
};

//Maggi.UI.IDE 1.0 compatibility
Maggi.UI_devel=Maggi.UI;
