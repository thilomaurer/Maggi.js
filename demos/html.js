var ui=Maggi({
	type:"object",
	children:{
		o:{type:"html"}
	}
});

var data=Maggi({o:"<ol><li>First<li>Second</ol>"});

Maggi.UI($('body'),data,ui);
