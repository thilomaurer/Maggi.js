var doc = function() {

	var baseprop=Maggi({
		typ:{
			name:"Type",
			propname:"type",
			proptype:"string",
			default:null,
			description: "This property defines the type of the UI element. There is a number of predefined types. For each type there is a list of additional (non-base) properties. The predefined types are: text, format, object, input, function, select, list, format, link, tabs and user." 
		},
		vis:{
			name:"Visibility",
			propname:"visible",
			proptype:"boolean",
			default:true,
			description: "This property defines whether the UI element is visible (true) or invisible (false). The style class \"invisible\" is set for the DOM element when not visible. The default CSS style for objects of the class invisible is visibility:hidden, such that the UI element does not occupy any space."
		},
		ena:{
			name:"Enabled / Active",
			propname:"enabled",
			proptype:"boolean",
			default:true,
			description: "This property defines whether the UI element is enabled (true) or disabled (false). The style class \"disabled\" is set for the DOM element when not enabled."
		},
		class:{
			name:"Class",
			propname:"class",
			proptype:"string or array-of-strings",
			default:'""',
			description: "This property defines a number of classes to be (always) set for the DOM element. Either by a space-separated string, or by an Array of Strings",
			example:'class:"red button" or class:["red","button"]'
		},
		builder:{
			name:"UI Builder",
			propname:"builder",
			proptype:"function(dom, data, ui)",
			default:'null',
			description: "This property provides a function that is executed after the UI element dom has been created according to the defined properties in ui. The function arguments dom (the HTML element), data (the data-model) and ui (the ui-model) are provided. The function may be used to attach bindings to data or ui, or to further customize the UI element dom. A return object is still to be defined."
		},
		popup:{
			name:"Popup",
			propname:"popup",
			proptype:"object",
			default:'null',
			description: "This property defines the UI element as the content of a popup. The UI element that acts as a trigger may be specified using the sub-property trigger, and needs to be a sister UI element of the local UI element. The UI element to focus before the popup with UI element becomes visible when triggered may be specified using the subelement focus, and needs to be a child element of the local UI element (grand-child-notation may be used)",
			example:'popup:{trigger:"triggerelement",focus:"focuselement"}'
		}
	});

	var textprop=Maggi({
	});
	
	var tabprop=Maggi({
	});

	var objprop=Maggi({
		chlddflt:{
			name:"Default for Children",
			propname:"childdefault",
			proptype:"object",
			default:null,
			description: "This property defines the default UI-model for each child. The default is that no default UI-model is defined.",
			example:'childdefault:{type:"input"}'
		},
		chld:{
			name:"Children",
			propname:"children",
			proptype:"object",
			default:null,
			description: "This property defines specific UI-models for each child of the UI element. For each property in the object 'children', an UI element is created for the corresponding data-model using the value of the property as its UI-model. Properties of the data-model that are not properties of 'children' will be formatted using the childdefault-format, if defined . In the example, the UI-model 'ui1' defines the UI of the data-model 'data1'. If the value of 'children' is null, any child (except functions) of the data-model is shown, using type \"text\" when the data-model is a string or number, using type \"object\" when the data-model is an object.",
			example:'children:{data1:ui1,data2:ui2}'
		},
		ordr:{
			name:"Order of Children",
			propname:"order",
			proptype:"array-of-string",
			default:null,
			description: "This property defines the order of the children within the UI element. The default value null defines no ordering. In practice this implies the same ordering as enumerating the data-model. The Javascript standard however defines an object as unordered, so the enumeration may be browser dependent. Children not listed in 'order' are ignored.",
			example:'order:["data2","data1"]'
		}
	});
	var inputprop=Maggi({
		ph:{
			name:"Placeholder",
			propname:"placeholder",
			proptype:"string",
			default:null,
			description: "String to show as a placeholder in the input when it is empty edit",
			example:'placeholder:"username"'
		},
		kind:{
			name:"Input Kind",
			propname:"kind",
			proptype:"string",
			default:null,
			description: "The kind of input is set to the type attribute of the input element. Common values are text, number, email, etc... See current HTML standard for a full list. ",
			example:'kind:"email"'
		},
		autosize: {
			name:"Autosize Length",
			propname:"sutosize",
			proptype:"bool",
			default:"false",
			description: "Have the width (number of characters) of the input matching the length of its content, i.e. the attribute 'size' of the input HTMLElement is kept in sync with the content-length.",
			example:'autosize:true'
		},
		onR:{
			name:"Return Key ",
			propname:"onReturn",
			proptype:"function(value)",
			default:null,
			description: "The function called with the current value of the input when the 'Return' key is being input by the user.",
			example:"function(v) { alert(v); }"
		}
	});

	var linkprop=Maggi({
		label:{
			name:"Label",
			propname:"label",
			proptype:"string",
			default:null,
			description: "String to show instead of the URL.",
			example:'label:"click here"'
		},
		target:{
			name:"Target",
			propname:"target",
			proptype:"string",
			default:null,
			description: "Location for the browser to open the link.",
			example:'target:"_blank"'
		}
	});

	var checkboxprop=Maggi({
		label:{
			name:"Label",
			propname:"label",
			proptype:"string",
			default:null,
			description: "String to show with the CheckBox",
			example:'label:"debug mode"'
		}
	});

	var propui={ 
		type:"object", 
		children: {
			name:{type:"text"},
			propname:{type:"text"},
			proptype:{type:"text"},
			default:{type:"text"},
			example:{type:"text"},
			description:{type:"text"}
		},
		class:"property"
	};

	var objcode=function(container) {
var data=Maggi({
	child1:"child 1",
	child2:"child 2",
	child3:{
		child31:"child 3.1",
		child32:"child 3.2"
	}
});

var ui=Maggi({
	type:"object",
	childdefault:null,
	children:{},
	order:[	
		"child3",
		"child2",
		"child1"
	]
});

Maggi.UI(container,data,ui);
	}

	var basecode=function(container) {
var data=Maggi({
	child1:"element1",
	child2:"element2",
	child3:"element3"
});

var ui=Maggi({
	type:"object",
	visible:true,
	enabled:false,
	class:"myclass"
});

Maggi.UI(container,data,ui);
	}

	var txtcode=function(container) {
var ui=Maggi({
	type:"object",
	children:{
		o:{type:"text"}
	}
});

var data=Maggi({o:"example-text"});

Maggi.UI(container,data,ui);
	}
	
	var htmlcode=function(container) {
var ui=Maggi({
	type:"object",
	children:{
		o:{type:"html"}
	}
});

var data=Maggi({o:"<ol><li>First<li>Second</ol>"});

Maggi.UI(container,data,ui);
	}

	var lnkcode=function(container) {
var ui=Maggi({
	type:"object",
	children:{
		o:{
			type:"link",
			label:"click here",
			target:"_blank"
		}
	}
});

var data=Maggi({o:"http://www.google.com"});

Maggi.UI(container,data,ui);
	}

	var cbxcode=function(container) {
var ui=Maggi({
	type:"object",
	children:{
		debug:{
			type:"checkbox",
			label:"debug mode"
		}
	}
});

var data=Maggi({debug:true});

Maggi.UI(container,data,ui);
	}

	var fnccode=function(container) {
var data=Maggi({
	myfunc:function() { alert("alert"); }
});

var ui=Maggi({
	type:"object",
	children:{
		myfunc:{
			type:"function",
			label:"label"
		}
	}
});

Maggi.UI(container,data,ui);
	}

	var inpcode=function(container) {
var ui=Maggi({
	type:"object",
	children:{
		username:{
			type:"input",
			placeholder:"name@domain",
			kind:"email",
			autosize:true,
			onReturn:function(v) { alert(v); }
		}
	}
});

var data=Maggi({username:""});

Maggi.UI(container,data,ui);
	}

	var lstcode=function(container) {
var ui=Maggi({
	type:"list",
	select:"multi",
	selected:{"child2":true}
});

var data=Maggi({
	child1:"element1",
	child2:"element2",
	child3:"element3"
});

Maggi.UI(container,data,ui);
	}
	
	var tabcode=function(container) {
var ui=Maggi({
	type:"tabs",
	headerui:{type:"object"},
	headerdata:{
		child1:"Header 1",
		child2:"Header 2",
		child3:"Header 3"
	},
	selected:"child2"
});

var data=Maggi({
	child1:"element1",
	child2:"element2",
	child3:"element3"
});

Maggi.UI(container,data,ui);
	}
	var pwcalccode=function(container) {
var data=Maggi({
	header:"Password Calculator",
	alias:"",
	secret:"",
	password:""
});

data.bind(function(k,v) {
	if (k=="alias"||k=="secret")
		data.password=calcPassword(data.alias,data.secret);
});

var calcPassword = function(alias,secret) {
	if (secret===""||alias==="") return "";
	var array = Sha1.hash(secret + alias).match(/.{1,2}/g);
	for (var i in array) array[i] = parseInt(array[i], 16);
	return btoa(String.fromCharCode.apply(null, array));
};

var ui=Maggi({
	type:"object",
	childdefault: {type:"text"},
	children: {
		alias: {type:"input", placeholder:"alias",class:""},
		secret: {type:"input", placeholder:"secret",class:""}
	},
	builder: function(dom,data,ui) {
        var validate=function(k,v) {
            if (k=="alias"||k=="secret")
                ui.children[k].class=(data[k]==="")?"redborder":"";
	    }
	    data.bind(validate);
	    validate("alias");
	    validate("secret");
	}
});

Maggi.UI(container,data,ui);
	}

	var removeFunction = function(v) {
		var cont=v.toString();
		var a=cont.indexOf("{")+1;
		var b=cont.lastIndexOf("}")-1;
		cont=cont.substr(a,b-a);
		return cont;
	}
	var demoobj = function(code) {
		return {
			source: {js:removeFunction(code), jsErrors:null, html:null},
			container: null,
		};
	};

	var d={
		base:{head:"Base",desc:"Every UI-model, independently of its type, contains the following base properties.",props:baseprop,democontainer:demoobj(basecode)},
		obj:{head:"Object",desc:"",props:objprop,democontainer:demoobj(objcode)},
		txt:{head:"Text",desc:"",props:textprop,democontainer:demoobj(txtcode)},
		html:{head:"HTML",desc:"",props:textprop,democontainer:demoobj(htmlcode)},
		inp:{head:"Input",desc:"",props:inputprop,democontainer:demoobj(inpcode)},
		fnc:{head:"Function",desc:"",props:inputprop,democontainer:demoobj(fnccode)},
		lnk:{head:"Link",desc:"",props:linkprop,democontainer:demoobj(lnkcode)},
		cbx:{head:"Checkbox (SHOULD NAME SWITCH?)",desc:"",props:checkboxprop,democontainer:demoobj(cbxcode)},
		lst:{head:"List",desc:"",props:tabprop,democontainer:demoobj(lstcode)},
		tab:{head:"Tabs",desc:"",props:tabprop,democontainer:demoobj(tabcode)},
		dem:{head:"Password Calculator Demo",desc:"This simple example demos a SHA1 Password Calculator.",democontainer:demoobj(pwcalccode)}
	};

	d.intro="<h2>Introduction</h2> <b>Maggi.js</b> is a Javascript framework that enables rapid development of object centric applications and their user-interfaces. The framework consists of two parts: <ul><li>The <b>Maggi.js</b> framework enables binding functions to events of object-properties.<li>The <b>Maggi.UI.js</b> framework is as user-interface framework that leverages the Maggi.js framework to bind to data- and ui-models in order to create and manage user-interfaces.</ul>";
	d.mag="<h2>Maggi.js</h2> Maggi.js is a Javascript framework that enables rapid development of object centric applications, by \"maggically\" adding bubbling property-events to any object. Binding functions to these events allows for a triggering for dependent updates.<BR>This is a demo for an object <I>data</I> that manages a shopping-cart:<BR>";
	d.magui='<h2>Maggi.UI.js</h2> Maggi.UI.js is a Javascript UI framework that enables rapid development of user-interfaces for object centric applications. It reliefs you from the burden of writing and managing the DOM tree of your web-application. Everything is managed under the hood, controlled though simple objects that define the UI. You don\'t need to see any HTML any longer. Maggi.UI steps beyond the MVC (model, view, controller) software architecture pattern: It drives applications using the MM (model, model) pattern: Maggi.UI creates (and updates) views and controllers fully automatically from two models: the data-model, an object that contains the data that is to be displayed (or not), and a second ui-model, an object that defines the layout and functionality of the UI for the data to be displayed. <BR><BR>          A UI-model may contains a number of properties that define the functionality of the UI element.<BR>             There are 3 types of specifing a UI-model:              <ol>                    <li>                    Direct specification using a Javascipt object variable<BR>                      <div class="preformatted">ui={<BR>  prop1:value1,<BR>  prop2:value2,<BR>  ...<BR>}</div>                        If any property is not set, its default value is implied.<BR>                   <li>                    If the UI-Model is a function, the function\'s return value will be used as UI model.                   <div class="preformatted">ui=function() { return {prop1:value1,prop2:value2,...}; }</div>          <li>                    Specifing the UI-Model as a string, is equivalent to setting the string for the type property of a model object:                      <div class="preformatted">ui=string<BR>ui={type:string}</div>           </ol>           The specification of the UI-model properties follows. Note, every UI-model contains the properties of base.   ';

	d=Maggi(d);
	
	var propui={ type:"list", listtype:"ordered", childdefault:propui};
/*
	var uiui={
		type:"object",
		children:{
			visible:{type:"bool"},
			enabled:{type:"bool"},
			onReturn:{type:"input",kind:"txt",class:"code",autosize:true},
			children:{type:"object",childdefault:{type:"uiui"},makechildlabels:true},
			childdefault:{type:"object",childdefault:{type:"input",autosize:true,kind:"text",class:"text"},makechildlabels:true},
			order:{type:"object",childdefault:{type:"input",autosize:true,kind:"text",class:"text"},makechildlabels:true},
			headerui:{type:"uiui"},
			headerdata:{type:"object",childdefault:{type:"input",autosize:true,kind:"text",class:"text"},makechildlabels:true}
		},
		childdefault:{type:"input",autosize:true,kind:"text",class:"text"},
		class:"uimodel-ui",
		makechildlabels:true
	};
	Maggi.UI.uiui=function(ui,v,setv,format) {
		if (!ui._Maggi) { 
			Maggi.UI(ui,v,uiui,setv);
		}
	}
	var dataui={
		type:"object",
		class:"uimodel-ui",
		childdefault:{type:"input",autosize:true,kind:"text",class:"text"},
		makechildlabels:true
	};
	Maggi.UI.dataui=function(ui,v,setv,format) {
		if (!ui._Maggi) { 
			Maggi.UI(ui,v,dataui,setv);
		}
	}
*/
/*
	Maggi.UI.code=function(ui,v,setv,format) {
		var set = function(v) {
			var cont=v.toString();
			var a=cont.indexOf("{")+1;
			var b=cont.lastIndexOf("}")-1;
			cont=cont.substr(a,b-a);
			ui._Maggi[0].value=cont;
		}
		if (!ui._Maggi) {
			Maggi.UI.BaseFunctionality(ui,format);

			var cont=v.toString();
			var a=cont.indexOf("{")+1;
			var b=cont.lastIndexOf("}")-1;
			cont=cont.substr(a,b-a);
			ui._Maggi=$('<textarea/>', { text: cont }).appendTo(ui)
			  .on("input",function(event) { 
				var func="function _Maggi_String2Function"+(_Maggi_String2Function++)+"(container) { "+this.value+ " };";
				eval(func);
				setv(func);
				event.stopPropagation();
			}).keydown(function(event) {
				event.stopPropagation();
			});
			format.bind(function(k,v) {
				if (k=="placeholder") ui._Maggi.attr("placeholder",v);
			});
		} else set(v);
	};
*/

	Maggi.UI.code=function(ui,v,setv,format) {
		if (!ui._Maggi) {
			Maggi.UI.BaseFunctionality(ui,format);
			var editor = ace.edit(ui[0]);
			editor.setTheme("ace/theme/xcode");
			editor.getSession().setMode("ace/mode/"+format.mode);
			editor.on("change", function(e) {
				setv(editor.getValue());
			});
			ui._Maggi=editor;
		}
		if (ui._Maggi.getValue()!=v) { ui._Maggi.setValue(v); ui._Maggi.clearSelection(); }
	};
/*
Maggi.UI.bool=function(ui,v,setv,format) {
	if (!ui._Maggi) {
		Maggi.UI.BaseFunctionality(ui,format);
	ui.click(function() { setv(!v); });
	} 
	ui.text(v);
};
*/

	var __String2FunctionID=0;
	var __String2Function={};
	var __String2FunctionArgs=[];
	var democontainer = {
		type:"object",
		children:{
			source: { 
				type:"object",
				children: {
					js: {type:"code",mode:"javascript"},
					//jsErrors: {type:"text"},
					html: {type:"code",mode:"html"},
					htmlErrors: {type:"text"},
					css: {type:"code",mode:"css"},
					cssErrors: {type:"text"}
				}
			},
			container: null
		},
		builder: function(dom,data,ui) {
			var build=function(v) {
				var func="__String2Function["+(__String2FunctionID)+"]=function(container) { " + v + " return({data:data,ui:ui}); };";
				var err="";
				var mm=null;
				try {
					eval(func);
					var f=__String2Function[__String2FunctionID]; __String2FunctionID++;
					mm=f(dom.ui.container);
				} catch (e) {
					if (e instanceof SyntaxError) {
						err="SyntaxError: "+ e.message;
					} else err=e.message;
				}
				data.source.jsErrors=err;
				var updateHTML=function() {
					data.source.html=html_beautify(dom.ui.container[0].outerHTML);
				};
				if (mm) {
					if (mm.ui) mm.ui.bind(updateHTML);
					if (mm.data) mm.data.bind(updateHTML);
				}
			};
			data.source.bind(function(k,v) {
				if (k=="js") { build(v); /*data.source.html=html_beautify(dom.ui.container[0].outerHTML);*/ }
			});
			// the following is a jquery-bind-thing
			dom.ui.container.bind("DOMSubtreeModified", function() {
				data.source.html=html_beautify(dom.ui.container[0].outerHTML);
			});
			build(data.source.js);
		}
	};

	var maketypeui = {
		type:"object",
		children:{
			head:{
				type:"format",
				format:"Properties of %s"
			},
			desc:{type:"text"},
			props:propui,
			democontainer: democontainer
		},
		order:["head","desc","democontainer","props"],
		class:"typeui"
	};
	var ui={
		type:"tabs",
		headerui:{type:"object"},
		headerdata:{
			intro:"Introduction",
			mag:"Maggi.js",
			magui:"Maggi.UI.js",
			base:"Base",
			obj:"Object",
			txt:"Text",
			html:"HTML",
			fnc:"Function",
			inp:"Input",
			lnk:"Link",
			cbx:"Checkbox",
			lst:"List",
			tab:"Tabs",
			dem:"Demo"
		},
		selected:"intro",
		childdefault:maketypeui,
		children: {
			intro:{type:"html"},
			mag:{type:"html"},
			magui:{type:"html"}
		}
	};


	//Maggi
	var data=shopping();
	d.mag=Maggi({
		head:"<h2>Maggi.js</h2> Maggi.js is a Javascript framework that enables rapid development of object centric applications, by \"maggically\" adding bubbling property-events to any object. Binding functions to these events allows for a triggering for dependent updates.<BR>This is a demo for an object <I>data</I> that manages the shopping-cart:<BR>",
		data:data,
		explanation:"This is a javascript-console, feel free to manipulate the items in the shopping cart data.cart.items or the items available data.items:",
		examples:"For example, try:",
		items:{
			a:"data.cart.items.banana=10",
			b:"data.cart.items.apple=4",
			c:'data.cart.items.add("orange",4)',
			d:'data.items.banana.name="rotten brown banana"',
			e:'data.items.banana.price=0.09'
		},
		console: {
			log:{},
			prompt:""
		}
	});

	var exec=function(js) {
		var msg;
		try {
			var a=eval(js);
			msg=JSON.stringify(a);
		} catch(e)
		{
			msg=e.message;
		}
		var n=Object.keys(d.mag.console.log).length
		d.mag.console.log.add(n,"> "+js);
		d.mag.console.log.add(n+1,msg);
	}
	var promptonEnter = function(v) {
		exec(v); 
		d.mag.console.prompt="";
	};

	HighlightedJS=function(ui,v,setv,format) { 
		Maggi.UI.BaseFunctionality(ui,format);
		var message=syntaxHighlight(v);
		if (format.prepend) message=format.prepend+message;
		ui.html(message);
	};

	var MaggiDemoUI=Maggi({
		type:"object",
		children:{
			head: {type:"html"},
			data: {type:"user", user:HighlightedJS,class:"scroll preformatted",bubbleupdate:true,prepend:"data="},
			explanation: {type: "text"},
			examples: {type: "text"},
			items: {type:"list", format:{type:"text",class:"link"},select:"single",selected:""},
			console: {
				type:"object",
				class:"scroll preformatted",
				children: {
					log: {type:"list", format:{type:"text"}},
					prompt: {type:"input",onReturn:promptonEnter,placeholder:"enter your js code here"}
				}
			}
		}
	});

	MaggiDemoUI.children.items.bind("set",function(k,v) {
		if (k=="selected") exec(d.mag.items[v]);
	});

	ui.children.mag=MaggiDemoUI;
	
	Maggi.UI($('#content'),d,ui);
}
