var checkbox=function(dom) {
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

	Maggi.UI(dom,data,ui);
};
