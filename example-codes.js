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

