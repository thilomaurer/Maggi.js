var ui=Maggi({
	type:"object",
	children:{
		o:{type:"text"}
	}
});

var data=Maggi({o:"example-text"});

Maggi.UI($('body'),data,ui);