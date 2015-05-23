var input=function(dom) {
	
	var ui=Maggi({
		type:"object",
		children:{
			username:{
				type:"input",
				placeholder:"name@domain",
				kind:"email",
				autosize:true,
				onReturnKey:function(v) { alert(v); }
			}
		},
		class:"mui"
	});

	var data=Maggi({username:""});

	Maggi.UI(dom,data,ui);
};
