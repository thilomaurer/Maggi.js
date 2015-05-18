var link=function(dom) {

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

	Maggi.UI(dom,data,ui);
};
