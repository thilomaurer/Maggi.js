var doc = function() {

	var baseprop=Maggi({
		typ:{
			name:"Type",
			propname:"type",
			proptype:"string",
			default:null,
			example:'type: "text"',
			description: "This property defines the type of the UI element. There is a number of predefined types. For each type there is a list of additional (non-base) properties. The predefined types are: text, format, object, input, function, select, list, format, link, tabs and user." 
		},
		vis:{
			name:"Visibility",
			propname:"visible",
			proptype:"boolean",
			default:true,
			example:"visible: false",
			description: "This property defines whether the UI element is visible (true) or invisible (false). The style class \"invisible\" is set for the DOM element when not visible. The default CSS style for objects of the class invisible is visibility:hidden, such that the UI element does not occupy any space."
		},
		ena:{
			name:"Enabled / Active",
			propname:"enabled",
			proptype:"boolean",
			default:true,
			example:"enabled: false",
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
			example:"function(dom, data, ui) { ui.visible=false; }",
			description: "This property provides a function that is executed after the UI element dom has been created according to the defined properties in ui. The function arguments dom (the HTML element), data (the data-model) and ui (the ui-model) are provided. The function may be used to attach bindings to data or ui, or to further customize the UI element dom. A return object is still to be defined."
		},
		popup:{
			name:"Popup",
			propname:"popup",
			proptype:"object",
			default:'null',
			description: "This property defines the UI element as the content of a popup. The UI element that acts as a trigger may be specified using the sub-property trigger, and needs to be a sister UI element of the local UI element. The UI element to focus before the popup with UI element becomes visible when triggered may be specified using the subelement focus, and needs to be a child element of the local UI element (grand-child-notation may be used)",
			example:'popup:{trigger:<triggerelement>,focus:<focuselement>}'
		}
	});

	var textprop=Maggi({
		Format:{
			name:"Formatting",
			propname:"format",
			proptype:"string",
			default:null,
			description: "This property defines the formatting of the text string to be displayed using printf formatting.",
			example:'format:"more than %4.4f years"'
		},
	});
	var htmlprop=Maggi({
	});
	
	var tabprop=Maggi({
	});

	var funcprop=Maggi({
	});

	var objprop=Maggi({
		chlddflt:{
			name:"Default Model for Children",
			propname:"childdefault",
			proptype:"object",
			default:null,
			description: "This property defines the default UI-model for each child. The default is that no default UI-model is defined. If the ui-model is given as a function, the model for each child is independent beeing returned from the function. If the UI-model is a object, all childen are modelled in lock-step to the same ui-model.",
			example:'childdefault:{type:"input"}'
		},
		chld:{
			name:"Children",
			propname:"children",
			proptype:"object",
			default:null,
			description: "This property defines specific UI-models for each child of the UI element. For each property in the object 'children', an UI element is created for the corresponding data-model using the value of the property as its UI-model. Properties of the data-model that are not properties of 'children' will be formatted using the childdefault-format, if such is defined. In the example, the UI-model 'ui1' defines the UI of the data-model 'data1'. If the value of 'children' is null (the default value), any child (except functions) of the data-model is shown, using type \"text\" when the data-model is a string or number, using type \"object\" when the data-model is an object.",
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
	
	var selectprop=Maggi({
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
		class:"property",order:["name","description","example","propname","proptype","default"]
	};

	var files = function() {
		var data=Maggi({});
		return data;
	}


	var sources={
		base:{name:"Base", srcs: ["api/demos/base.js","api/demos/my.css"]},
		object:{name:"Object", srcs: ["api/demos/object.js","api/demos/my.css"]},
		text:{name:"Text", srcs: ["api/demos/text.js","api/demos/my.css","ide/sprintf.js"]},
		html:{name:"HTML", srcs: ["api/demos/html.js","api/demos/my.css"]},
		function:{name:"Function", srcs: ["api/demos/func.js","api/demos/my.css"]},
		input:{name:"Input", srcs: ["api/demos/input.js","api/demos/my.css"]},
		link:{name:"Link", srcs: ["api/demos/link.js","api/demos/my.css"]},
		checkbox:{name:"Checkbox", srcs: ["api/demos/checkbox.js","api/demos/my.css"]},
		list:{name:"List", srcs: ["api/demos/list.js","api/demos/my.css"]},
		tabs:{name:"Tabs", srcs: ["api/demos/tabs.js","api/demos/my.css"]},
		select:{name:"Select", srcs: ["api/demos/select.js","api/demos/my.css"]},
		demo:{name:"Password Calculator", srcs: ["api/demos/pwcalc.js","api/demos/pwcalc.css","api/demos/pwcalc.html","api/demos/utils.js"]},
	};

	var d={
		base:{head:"Base",demoprj:null,desc:"Every UI-model, independently of its type, contains the following base properties.",props:baseprop},
		object:{head:"Object",demoprj:null,desc:"",props:objprop},
		text:{head:"Text",demoprj:null,desc:"",props:textprop},
		html:{head:"HTML",demoprj:null,desc:"",props:htmlprop},
		input:{head:"Input",demoprj:null,desc:"",props:inputprop},
		function:{head:"Function",demoprj:null,desc:"",props:funcprop},
		link:{head:"Link",demoprj:null,desc:"",props:linkprop},
		select:{head:"Select",demoprj:null,desc:"",props:selectprop},
		checkbox:{head:"Checkbox (SHOULD NAME SWITCH?)",demoprj:null,desc:"",props:checkboxprop},
		list:{head:"List",demoprj:null,desc:"",props:tabprop},
		tabs:{head:"Tabs",demoprj:null,desc:"",props:tabprop},
		demo:{head:"Password Calculator Demo",demoprj:null,desc:"This simple example demos a SHA1 Password Calculator."}
	};
	
	d.intro="<h2>Introduction</h2> <b>Maggi.js</b> is a Javascript framework that enables rapid development of object centric applications and their user-interfaces. The framework consists of two parts: <ul><li>The <b>Maggi.js</b> framework enables binding functions to events of object-properties.<li>The <b>Maggi.UI.js</b> framework is as user-interface framework that leverages the Maggi.js framework to bind to data- and ui-models in order to create and manage user-interfaces.</ul>";
	d.mag="<h2>Maggi.js</h2> Maggi.js is a Javascript framework that enables rapid development of object centric applications, by \"maggically\" adding bubbling property-events to any object. Binding functions to these events allows for a triggering of dependent updates.<BR>This is a demo for an object <I>data</I> that manages a shopping-cart:<BR>";
	d.magui='<h2>Maggi.UI.js</h2> Maggi.UI.js is a Javascript UI framework that enables rapid development of user-interfaces for object centric applications. It reliefs you from the burden of writing and managing the DOM tree of your web-application. Everything is managed under the hood, controlled though simple objects that define the UI. You don\'t need to see any HTML any longer. Maggi.UI steps beyond the MVC (model, view, controller) software architecture pattern: It drives applications using the MM (model, model) pattern: Maggi.UI creates (and updates) views and controllers fully automatically from two models: the data-model, an object that contains the data that is to be displayed (or not), and a second ui-model, an object that defines the layout and functionality of the UI for the data to be displayed. <BR><BR>          A UI-model may contains a number of properties that define the functionality of the UI element.<BR>             There are 3 ways to specify a UI-model:              <ol>                    <li>                    Direct specification using a Javascipt object variable<BR>                      <div class="preformatted">ui={<BR>  prop1:value1,<BR>  prop2:value2,<BR>  ...<BR>}</div><BR>                   <li>                    If the UI-Model is a function, the function\'s return value will be used as UI model.                   <div class="preformatted">ui=function() { return {prop1:value1,prop2:value2,...}; }</div>          <li>                    Specifing the UI-Model by a string is equivalent to using a object with the type property set to that string:                      <div class="preformatted">ui=string<BR>ui={type:string}</div>           </ol>           A specification of the predefined UI-models follows.  ';

	d=Maggi(d);

	var loaded=0;	
	$.each(d,function(k,v) {
		var x=sources[k];
		if (x==null) return;
		var files=["ide/jquery.js","ide/Maggi.js","ide/Maggi.UI.js","ide/Maggi.UI.css","ide/Maggi.UI.input.css","ide/Maggi.UI.select.css"];
		files=x.srcs.concat(files);

		initproject(
			{name:"<nobody>",username:"username",email:"username@domain.com"},
			{name:x.name},files,
			function(project) {
				project.view.panes.add(0,{fileid:1,mode:"edit"});
				project.view.panes.add(1,{fileid:2,mode:"edit"});
				project.view.panes.add(2,{fileid:1,mode:"preview"});
				project.view.panes.order=[0,1,2];
				var rev=project.revisions[0];
		    		projectfuncs(project).branch(rev)();
				v.demoprj=project;
				loaded+=1;
				if (loaded==Object.keys(sources).length)
					start();
			}
		);
	});


	
	var propui={ type:"list", listtype:"ordered", childdefault:propui}
	var maketypeui = function() {
		return {
			type:"object",
			children:{
				head:{
					type:"format",
					format:"Properties of %s"
				},
				demoprj:prjui(),
				desc:{type:"text"},
				props:propui,
			},
			builder(dom,data,ui) {
				ui.children.demoprj.mode="active";
			},
			order:["head","demoprj","desc","props"],
			class:"typeui"
		};
	};

	var ui=Maggi({
		type:"tabs",
		headerui:{type:"object",childdefault:"text"},
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
			select:"Select",
			list:"List",
			tabs:"Tabs",
			demo:"Demo"
		},
		selected:"intro",
		childdefault:maketypeui,
		children: {
			intro:{type:"html"},
			mag:{type:"html"},
			magui:{type:"html"},
			base:maketypeui(),
			object:maketypeui(),
			text:maketypeui(),
			html:maketypeui(),
			function:maketypeui(),
			input:maketypeui(),
			link:maketypeui(),
			checkbox:maketypeui(),
			select:maketypeui(),
			list:maketypeui(),
			tabs:maketypeui(),
			demo:maketypeui(),
		}
	});


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

	HighlightedJS=function(dom,data,setdata,ui,datachange) { 
		var backbuild=Maggi.UI.BaseFunctionality(dom,data,setdata,ui,datachange);
		var build=function() {
			var message=syntaxHighlight(data);
			if (ui.prepend) message=ui.prepend+message;
			dom.html(message);
		}
		//datachange(build);
		build();
		data.bind("set",build);
		return backbuild;
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

	var start=function() {	
		Maggi.UI($('#content'),d,ui);
	}
}
