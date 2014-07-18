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

Maggi.UI($('body'),data,ui);
