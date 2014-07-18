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

Maggi.UI($('body'),data,ui);
