/*!
 * Maggi.UI.js JavaScript Library 
 * https://home.thilomaurer.de/Maggi.js
 *
 * Copyright (C) 2014-05-22 Thilo Maurer
 * All Rights Reserved.
 * 
 */

function cookui(ui) {
	if (!ui) return;
	if (typeof ui === "function") ui=ui();
	if (typeof ui === "string") ui={type:ui};
	ui=Maggi(ui);
	return ui;
}

Maggi.UI=function(dom,data,ui,setdata,id) {
	if (!dom) return;
	ui=cookui(ui);
	if (!ui) return;
	if (id) dom[0].id=id;  //TBD: not sure if setting id from this function is required at all!
	dom.addClass(ui.type);
	var f;
	if (ui.type=="user") f=ui.user;	else f=Maggi.UI[ui.type];
	if (f) f(dom,data,setdata,ui); else console.log("Maggi.UI: unknown ui.type "+ui.type);
	//return {dom:dom,data:data,ui:ui};
};

//non-object UI handlers
//
function assert(x) {
	if (x==null)
		console.log("null assertion");
}


Maggi.UI.BaseFunctionality=function(ui,format) {
	assert(ui);

	var updateClass = function(v, ui, cls) {
		if (v) ui.addClass(cls); else ui.removeClass(cls); 
	}
	
	if (format.popup) {
		var triggerElement=ui._MaggiParent.ui[format.popuptrigger];
		var deco=$('<div/>', {'class': "popup-triangle"}).insertBefore(ui);
		ui.addClass("popup");

		$(window).resize(place);
		ui.mutate('width height top left right bottom', function(el,info) {
			place();
		});
		if (triggerElement==null) { console.log("Maggi.UI: triggerelement not found."); return; }
		triggerElement.mutate('width height top left right bottom', function(el,info) {
			place();
		});
		triggerElement.click(function() {
			format.visible=!format.visible;
			return false;
		});

		var place = function()
		{
			var spacing=16;
			var o=triggerElement[0].getBoundingClientRect();
			var pl=parseInt(triggerElement.css("padding-left").replace("px", ""));
			var pb=parseInt(triggerElement.css("padding-bottom").replace("px", ""));
			var trigger_bottom=o.bottom-pb;
			var trigger_left=o.left+pl;
			var left=trigger_left+o.width/2-ui.width()/2;
			var bw=$('body').width();
			if (left+ui.outerWidth()+spacing>bw) left=bw-ui.outerWidth()-spacing;
			if (left<spacing) left=spacing;
			ui.css("top",trigger_bottom+spacing);
			ui.css("left",left);
			deco.css("top",trigger_bottom);
			deco.css("left",trigger_left+o.width/2-spacing);
		}
		format.bind("set",function(k,v) {
			if (k=="visible") {
				if (v) { 
					deco.removeClass("hidden"); 
					ui.removeClass("hidden"); 
					place();
					if (format.popupfocus) {
						var p=ui.ui[format.popupfocus]._Maggi[0];
						p.focus();
						p.select();
					}
				} else {
					deco.addClass("hidden"); 
					ui.addClass("hidden"); 
				}
			}
		});
		if (!format.hasOwnProperty("visible")) format.add("visible",false); 
		if (format.visible==true) place();
		if (format.visible==false) { ui.addClass("hidden"); deco.addClass("hidden"); }
	} else {
		format.bind("set",function(k,v) {
			if (k=="visible") updateClass(v==false,ui,"invisible");
		});
		updateClass(format.visible==false,ui,"invisible");
	}
	format.bind("set", function(k,v,oldv) {
		if (k=="enabled") updateClass(v,ui,"disabled");
		if (k=="class") { ui.removeClass(oldv); ui.addClass(v); }
	});
	updateClass(format.enabled==false,ui,"disabled");
	if (format.class) 
		ui.addClass(format.class);
}

Maggi.UI.parentclass=function(ui,s,sets,format) {
	if (!ui._Maggi) {
		var p=ui._MaggiParent;
		p.addClass(s);
		p._Maggi.bind("set",function(k,newv,oldv) { 
			if (k=="state") {
				p.removeClass(oldv);
				p.addClass(newv);
			}
		});
	} 
	ui._Maggi=true;
}

Maggi.UI.text=function(dom,data,sets,ui) {
	Maggi.UI.BaseFunctionality(dom,ui);
	dom.text(data&&data.toString());
	//return {dom:dom,data:data,ui:ui}
};

Maggi.UI.html=function(ui,s,sets,format) {
	Maggi.UI.BaseFunctionality(ui,format);
	ui.html(s&&s.toString());
};

Maggi.UI.link=function(ui,v,setv,format) {
	if (!ui._Maggi) {
		Maggi.UI.BaseFunctionality(ui,format);
		ui._Maggi=$('<a>', {href:v,text:format.label,target:format.target}).appendTo(ui);
		format.bind("set",function(k,v) {
			if (k=="label") ui._Maggi.text(v);
			if (k=="target") ui._Maggi.attr("target",v);
		});
	} else ui._Maggi.attr("href",v);
};

Maggi.UI.image=function(ui,v,setv,format) {
	var updatesrc = function() {
		ui._Maggi.attr("src",format.urls[v]);
	};
	if (!ui._Maggi) {
		Maggi.UI.BaseFunctionality(ui,format);
		ui._Maggi=$('<img>').appendTo(ui);
		format.bind("set",function(k,v) {
			if (k[0]=="urls") updatesrc();
		});
	} 
	updatesrc();
};

Maggi.UI.checkbox=function(ui,v,setv,format) {
	if (!ui._Maggi) {
		Maggi.UI.BaseFunctionality(ui,format);
		var name="maggi_"+Maggi.UI.select.counter.toString(); Maggi.UI.select.counter++;
		var id=name+"_id";
		ui._Maggi=$("<input>",{name:name,id:id,type:"checkbox"}).appendTo(ui).change(function() {
			if (setv) setv(this.checked);
		});
		$("<label>",{for:id,text:format.label}).appendTo(ui);
	} 
	if (v) ui._Maggi[0].setAttribute("checked","checked"); else ui._Maggi[0].removeAttribute("checked");
};

Maggi.UI.input=function(ui,v,setv,format) {
	var autolength=function(o,v) {
		if (format.autosize) {
			v=v.toString();
			var l=v.length;
			if (l==0) o.addClass("empty"); else o.removeClass("empty");
			o.attr("size",l);
		}
	}
	if (!ui._Maggi) {
		Maggi.UI.BaseFunctionality(ui,format);

		ui._Maggi=$('<input/>', { type: format.kind, value: v&&v.toString(), placeholder:format.placeholder }).appendTo(ui)
		  .on("input",function(event) { 
			autolength(ui._Maggi,this.value);
			setv(this.value);
			event.stopPropagation();
		}).on("keypress",function(event) { 
			if (event.keyCode == '13') { if (format.onReturn) format.onReturn(this.value); }
			event.stopPropagation();
		}).keydown(function(event) {
			event.stopPropagation();
		});
		format.bind("set",function(k,v) {
			if (k=="placeholder") ui._Maggi.attr("placeholder",v);
		});
		autolength(ui._Maggi,v);
	} else if (ui._Maggi[0].value!=v) { ui._Maggi[0].value=v; autolength(ui._Maggi,v); }
};

Maggi.UI.function=function(ui,v,setv,format) {
	if (!ui._Maggi) {
		Maggi.UI.BaseFunctionality(ui,format);
		ui._Maggi=$('<button/>').text(format.label).appendTo(ui);
		format.bind(function(k,v) { if (k=="label") ui._Maggi.text(v); });
	}
	ui._Maggi.off("click"); //remove old click handler
	ui._Maggi.click(function() {
		v(ui._MaggiParent._Maggi);
		return false;
	});
};

Maggi.UI.select=function(ui,v,setv,format) {
	if (!ui._Maggi) {
		Maggi.UI.BaseFunctionality(ui,format);
		var name="maggi_"+Maggi.UI.select.counter.toString(); Maggi.UI.select.counter++;
		ui._Maggi={};
		$.each(format.choices,function(k,v) {
			var id=name+"_"+k.toString();
			ui._Maggi[v]=$("<input>",{name:name,id:id,value:v,type:"radio"}).appendTo(ui).change(function() {
				if (this.checked) if (setv) setv(v);
			});
			$("<label>",{for:id,text:v}).appendTo(ui);
		});
	}
	$.each(ui._Maggi,function(k,val) {
		if (k==v) val[0].setAttribute("checked","checked"); else val[0].removeAttribute("checked");
	});
};
Maggi.UI.select.counter=0;

Maggi.UI.format=function(ui,v,setv,format) { 
	Maggi.UI.BaseFunctionality(ui,format);
	var s=format.format;
	if (v!=null) s=vsprintf(s,[v]);
	ui.text(s);
};

Maggi.UI.object=function(ui,o,seto,format) {
	if (o==null||typeof o != "object") { ui.empty(); return; }
	if (!(ui._Maggi===o)) {
		ui.empty();
		Maggi.UI.BaseFunctionality(ui,format);
		ui._Maggi=o;
		var chld={};
		ui.ui=chld;

		var updateFormat=function(k) {
			if (!format.children) format.add("children",{});
			if (k instanceof Array) { k=k[0]; if (!(format.children[k]&&format.children[k].bubbleupdate)) return; }
			if (format.children[k]) return;
			var ui=null;
			if (format.childdefault) { 
				format.children.add(k,format.childdefault);
				return;
			} 
			//default formatting
			console.log("Maggi.UI: default formating.");
			var fmt="text";
			if ((o[k] instanceof Object)&&(!(o[k] instanceof Date))) fmt="object";
			if (((o[k] instanceof Object)&&(!(o[k] instanceof Date))&&(!(typeof o[k] == "function")))&&(fmt.type=="text"||fmt.type=="input")) {
				fmt={type:"object",childdefault:format.childdefault,makechildlabels:format.makechildlabels};
			}
			//format.children[k]=fmt; 
			format.children.add(k,fmt);
		}

		var update=function(k) { 
			updateFormat(k);
			var f=cookui(format.children[k]);
			format.children[k]=f;
			Maggi.UI(chld[k],o[k],format.children[k],function(v) { o[k]=v; });
		};
		var make=function(k) {
			chld[k]=$("<"+(format.childHTMLElement||"div")+">",{id:k}).appendTo(ui); 
			if (format.makechildlabels) { 
				$("<div>",{"class":"label",text:k}).appendTo(chld[k]); 
				chld[k]=$("<div>").appendTo(chld[k]); 
			}
			chld[k]._MaggiParent=ui;  //ugly hack to enable access to parent 
		}
		var add=function(k) {
			if (o.hasOwnProperty(k)) {
				make(k);
				update(k);
			}
		}
		var remove=function(k) {
			if (chld.hasOwnProperty(k)) { chld[k].remove(); if (chld[k]._MaggiUnbind) chld[k]._MaggiUnbind(); delete chld[k]; }
		}
		if (format.order) {
			$.each(format.order, function(idx,v) { add(v); });
		} else if (format.childdefault) {
			$.each(o, add);
		} else if (format.hasOwnProperty("children")) {
			if (format.children) $.each(format.children, add);
		} else {
			$.each(o, add);
		}
		o.bind("set", update);
		o.bind("add", add);
		o.bind("remove", remove);
		format.bind("set",function(k,newv,oldv) {
			var hasPropValue = function(o,v) {
				for (var k in o) { if (o[k]==v) return true; }
				return false;
			};
			if (k=="order"||k[0]=="order") {
				$.each(oldv, function(idx,v) { if (!hasPropValue(newv,v)) remove(v); });
				$.each(newv, function(idx,k) { if (chld[k]) chld[k].appendTo(ui); else add(k); });
			}
		});
		if (format.builder) format.builder(ui,o,format);
	}
};

Maggi.UI.tabs=function(ui,o,seto,format) {
	if (o==null) {ui.empty(); return; }
	if (!(ui._Maggi===o)) {
		Maggi.UI.BaseFunctionality(ui,format);
		ui._Maggi=o;
		ui.empty();
		ui.head=$("<div>",{id:"_Maggi_UI_TabView_Header"}).appendTo(ui); 
		if (format.headerdata&&format.headerui) { 
			Maggi.UI(ui.head,format.headerdata,format.headerui, function(v) {format.headerdata=v; }); 
			$.each(ui.head.ui,function(k,v) {
				v.click(function() { format.selected=k; return false;});
			});
		}
		ui.chld=$("<div>",{id:"_Maggi_UI_TabView_Container"}).appendTo(ui);

		Maggi.UI.object(ui.chld,o,seto,format);
		var select=function(k,s) {
			if (s&&ui.chld.ui[s]) {
				ui.chld.ui[s].removeClass("selected");
				ui.head.ui[s].removeClass("selected");
			}
			if (k&&ui.chld.ui[k]) {
				format.selected=k;
				ui.chld.ui[k].addClass("selected");
				ui.head.ui[k].addClass("selected");
			}
		}
		select(format.selected,null);
		format.bind("set",function(k,v,oldv) {
			if (k=="selected") select(v,oldv);
		});
	}
};

Maggi.UI.list=function(ui,o,seto,format) {
	if (o==null) {ui.empty(); return; }
	if (!(ui._Maggi===o)) {
		var childHTMLElement="div";
		var listContainerHTMLElement="div";
		if (format.listtype=="ordered") listContainerHTMLElement="ol";
		if (format.listtype=="unordered") listContainerHTMLElement="ul";
		if (format.listtype) { ui.empty(); format.childHTMLElement="li"; ui=$('<'+listContainerHTMLElement+'>').appendTo(ui); }
		Maggi.UI.object(ui,o,seto,format);
		ui._Maggi=o;
		var installClick = function(k,v) {
			v.click(function() { select(k); return false; });
		}
		if (ui.ui) $.each(ui.ui,installClick);
		var chld=ui.ui;
		var select=function(k) {
			if (format.select=="single") format.selected=k;
			if (format.select=="multi") {
				format.selected.add(k,!format.selected[k]);
			}
		}
		var updateSingleSelection = function(newv,oldv) {
			if (oldv) if (chld[oldv]) chld[oldv].removeClass("selected");
			if (newv) if (chld[newv]) chld[newv].addClass("selected");
		};
		var updateMultiSelection = function(k,v) {
			var c=chld[k];
			if (c) if (v) c.addClass("selected"); else c.removeClass("selected");
		};
		if (format.select=="single") updateSingleSelection(format.selected,null);
		if (format.select=="multi") $.each(format.selected, updateMultiSelection);
		format.bind("set",function(k,newv,oldv) {
			if (k=="selected") updateSingleSelection(newv,oldv);
			if (k[0]=="selected") updateMultiSelection(k[1],newv,oldv);
			if (k=="select") {
				if (newv=="single") format.selected=null;
				if (newv=="multi") format.selected={};
			}
		});
		o.bind("add",function(k,v) {
			if (typeof k == "string") installClick(k,ui.ui[k]);	
		});
	}
};

