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

	
	var filesui=function() { 
		return Maggi({ 
			type:"list",
			childdefault:fileui,
			select:"single",
			selected:""
		});
	};

	var fileui=function() {
		return Maggi({
			type:"object",
			children:{
				type: {type:"image",urls:{js:"icons/js.svg",html:"icons/html5.svg",css:"icons/css3.svg"}},
				name: {type:"text"},
			},
			order:["type","name"],
			class:"myfile",
		});
	}

	var files = function() {
		var data=Maggi({});
		return data;
	}

	var demoobj = function() {
		var f=files();
		var sources=["jquery-2.0.3.js",
		 "Maggi.js",
		 "Maggi.UI.js",
		 "demos/pwcalc.js",
		 "demos/pwcalc.css","demos/pwcalc.html"];
		 var loadNextSource = function() {
			if (sources.length==0) return;
			var k=sources[0];
			sources.shift();
			$.get( k, null, function(data) {
				var parts=k.split(".");
				var type="text";
				if (parts.length>0) type=parts[parts.length-1];
				var key=Object.keys(f).length.toString();
				f.add(key,{name:k,type:type,data:data});
				loadNextSource();
			},"text");
		};
		loadNextSource();

		var panedata=function() {
			var p=Maggi({
				file:{name:"<unnamed>"},
				filepopup:f,
				mode:"code",
				editor:"",
				menu:"☰",
				actions: {},
				preview: {
					name: null,
					html: null,
					head: {},
					styles: {}, 
					scripts: {},
					file: null,
					files: f
				}
			});
			p.actions.add("renamefile",function() {
				var f=p.file;
				var newname=prompt("Please enter new name for file '"+p.file.name+"'", p.file.name);
				p.file.name=newname;
				//p.actions.visible
			});
			return p;
		}

		var addpane=function() {
			var n=Object.keys(data.panes).length;
			data.panes.add(n,panedata());
		};

		var data=Maggi({
			addpane: addpane,
			panes: {}
		});
		data.panes.bind("add",function(k,v) {
			if (k instanceof Array) return;
			v.actions.add("closepane",function() {data.panes.remove(k);});
		});
		addpane();
		return data;
	};

	var d={
		base:{head:"Base",desc:"Every UI-model, independently of its type, contains the following base properties.",props:baseprop,democontainer:demoobj()},
		object:{head:"Object",desc:"",props:objprop,democontainer:demoobj()},
		text:{head:"Text",desc:"",props:textprop,democontainer:demoobj()},
		html:{head:"HTML",desc:"",props:textprop,democontainer:demoobj()},
		input:{head:"Input",desc:"",props:inputprop,democontainer:demoobj()},
		function:{head:"Function",desc:"",props:inputprop,democontainer:demoobj()},
		link:{head:"Link",desc:"",props:linkprop,democontainer:demoobj()},
		checkbox:{head:"Checkbox (SHOULD NAME SWITCH?)",desc:"",props:checkboxprop,democontainer:demoobj()},
		list:{head:"List",desc:"",props:tabprop,democontainer:demoobj()},
		tabs:{head:"Tabs",desc:"",props:tabprop,democontainer:demoobj()},
		pwcalc:{head:"Password Calculator Demo",desc:"This simple example demos a SHA1 Password Calculator.",democontainer:demoobj()}
	};


	d.intro="<h2>Introduction</h2> <b>Maggi.js</b> is a Javascript framework that enables rapid development of object centric applications and their user-interfaces. The framework consists of two parts: <ul><li>The <b>Maggi.js</b> framework enables binding functions to events of object-properties.<li>The <b>Maggi.UI.js</b> framework is as user-interface framework that leverages the Maggi.js framework to bind to data- and ui-models in order to create and manage user-interfaces.</ul>";
	d.mag="<h2>Maggi.js</h2> Maggi.js is a Javascript framework that enables rapid development of object centric applications, by \"maggically\" adding bubbling property-events to any object. Binding functions to these events allows for a triggering for dependent updates.<BR>This is a demo for an object <I>data</I> that manages a shopping-cart:<BR>";
	d.magui='<h2>Maggi.UI.js</h2> Maggi.UI.js is a Javascript UI framework that enables rapid development of user-interfaces for object centric applications. It reliefs you from the burden of writing and managing the DOM tree of your web-application. Everything is managed under the hood, controlled though simple objects that define the UI. You don\'t need to see any HTML any longer. Maggi.UI steps beyond the MVC (model, view, controller) software architecture pattern: It drives applications using the MM (model, model) pattern: Maggi.UI creates (and updates) views and controllers fully automatically from two models: the data-model, an object that contains the data that is to be displayed (or not), and a second ui-model, an object that defines the layout and functionality of the UI for the data to be displayed. <BR><BR>          A UI-model may contains a number of properties that define the functionality of the UI element.<BR>             There are 3 types of specifing a UI-model:              <ol>                    <li>                    Direct specification using a Javascipt object variable<BR>                      <div class="preformatted">ui={<BR>  prop1:value1,<BR>  prop2:value2,<BR>  ...<BR>}</div>                        If any property is not set, its default value is implied.<BR>                   <li>                    If the UI-Model is a function, the function\'s return value will be used as UI model.                   <div class="preformatted">ui=function() { return {prop1:value1,prop2:value2,...}; }</div>          <li>                    Specifing the UI-Model as a string, is equivalent to setting the string for the type property of a model object:                      <div class="preformatted">ui=string<BR>ui={type:string}</div>           </ol>           The specification of the UI-model properties follows. Note, every UI-model contains the properties of base.   ';

	d=Maggi(d);
	
	var propui={ type:"list", listtype:"ordered", childdefault:propui};

	Maggi.UI.code=function(dom,data,setv,ui) {
		if (!dom._Maggi) {
			Maggi.UI.BaseFunctionality(dom,ui);
			
			var d=Maggi({editor:"",annot:{}});
			var fmt=Maggi({
				type:"object",
				children: {
					editor:{type:"text"},
					annot:{
						type:"list",
						childdefault:{
							type:"object",
							order:["type","row","column","text"]
						},
						select:"single",
						selected:null, 
						class:"scroll"
					}
				}
			});
			Maggi.UI(dom,d,fmt);
			
			var editor = ace.edit(dom.ui.editor[0]);

			function updateMode() {
				var mode="text";
				if (ui.mode=="js") mode="javascript";
				if (ui.mode=="css") mode="css";
				if (ui.mode=="html") mode="html";
				editor.getSession().setMode("ace/mode/"+mode);
			}

			ui.bind(function(k,v) {
				if (k=="mode") updateMode();
			});
			editor.setTheme("ace/theme/xcode");
			updateMode();
			editor.on("change", function(e) {
				if (!dom._MaggiDisableEvents) setv(editor.getValue());
	 		});
			editor.getSession().on("changeAnnotation", function() {
				d.annot = editor.getSession().getAnnotations();
			});	
			dom._Maggi=editor;
			dom._MaggiDisableEvents=false; //hack to work around ACE issue.
		}
		if (dom._Maggi.getValue()!=data) {
			dom._MaggiDisableEvents=true; //hack to work around ACE issue.
			var pos=dom._Maggi.getCursorPosition();
//			dom._Maggi.clearSelection();
			dom._Maggi.setValue(data);
			dom._Maggi.moveCursorToPosition(pos);
			dom._MaggiDisableEvents=false;
		}
	};


	var paneui = function() {
		var fui=filesui();
		fui.add("popup",true);
		fui.add("popuptrigger","file");
		return Maggi({
			type:"object",
			children:{
				file:fileui,
				filepopup:fui,
				mode:{type:"select",choices:["code","preview"],class:"items2"},
				menu:{type:"text"},
				actions: {
					type:"object",
					popup:"true", popuptrigger:"menu",
					children: {
						closepane:{type:"function",label:"close pane"},
						renamefile:{type:"function",label:"rename file"}
					}
				},
				closepane:{type:"function",label:"X"},
				editor: {type:"code",mode:""},
				preview: {type:"iframe"}
			},
			order:[],
			class:"pane",
			builder:function(dom,data,ui) {
				ui.children.filepopup.bind(function(k,v) {
					var openfile = function(file) {
						if (file.type!="directory") {
							data.file=file;
							ui.children.filepopup.visible=false;
						}
					};
					if (k instanceof Array) {
						var N=k.length;
						if (k[N-1]!="selected") return;
						var root=data.filepopup;
						for (var i=1;i<N-1;i+=2) root=root[k[i]];
						openfile(root[v]);
					}
					if (k=="selected") openfile(data.filepopup[v]);
				});
				var modeorder={
					code:["file","filepopup","mode","menu","actions","editor"],
					preview:["file","filepopup","mode","menu","actions","preview"]
				};
				var updateFileData = function() {
					var d=data.file.data;
					data.editor=d;
					//if (data.file.type=="html") 
					//	data.preview.html=d;
				};
				var updateFile = function() {
					ui.children.editor.mode=data.file.type;
					data.preview.file=data.file;
					updateFileData();
				};
				data.bind(function(k,v) {
					if (k=="file") updateFile();
					if (k[0]=="file"&&k[1]=="data") updateFileData();
					if (k=="editor") data.file.data=v;
					if (k=="mode") ui.order=modeorder[v];
				});
				ui.order=modeorder[data.mode];
			}
		});
	}
	

	var democontainerui = function() {
		return {
			type:"object",
			children:{
				//files: filesui,
				addpane: {type:"function",label:"Add Pane"},
				panes: { 
					type:"object",
					childdefault: paneui,
				}
			},
			builder: function(dom,data,ui) {
/*	
				data.iframe.scripts.add("require.js",null);
				//"<script data-main="scripts/main" src="scripts/require.js"></script>
				var runmain=function() {
					data.iframe.scripts.remove("main.js");
					data.iframe.scripts.add("main.js",'require(["helper/util"],main);');
				}
*/
/*
				var buildjs=function() {
					v="var main=function() {\n"+data.source.js+"};";
					data.iframe.scripts.remove("demo.js");
					data.iframe.scripts.add("demo.js",v);
				};
				var addfile=function(k,v) {
					var file=data.files[k];
					if (file.type=="js")
						data.iframe.scripts.add(file.name,file.data);
					if (file.type=="css")
						data.iframe.styles.add(file.name,file.data);
				}
				var removefile=function(k,v) {
					var file=data.files[k];
					if (file.type=="js")
						data.iframe.scripts.remove(file.name);
					if (file.type=="css")
						data.iframe.styles.remove(file.name);
				}
				data.files.bind("add",addfile);
				data.files.bind("remove",removefile);
				data.files.bind(function(k,v) {
					removefile(k[0]);
					addfile(k[0]);
					runmain();
				});
				for (var k in data.files) addfile(k);
				runmain();*/
			}
		};
	};

	var maketypeui = function() {
		return {
			type:"object",
			children:{
				head:{
					type:"format",
					format:"Properties of %s"
				},
				desc:{type:"text"},
				props:propui,
				democontainer: democontainerui
			},
			order:["head","desc","democontainer","props"],
			class:"typeui"
		};
	};

	var ui={
		type:"tabs",
		headerui:{type:"object"},
		headerdata:{
			intro:"Introduction",
			mag:"Maggi.js",
			magui:"Maggi.UI.js",
			base:"Base",
			object:"Object",
			text:"Text",
			html:"HTML",
			function:"Function",
			input:"Input",
			link:"Link",
			checkbox:"Checkbox",
			list:"List",
			tabs:"Tabs",
			pwcalc:"Demo"
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
