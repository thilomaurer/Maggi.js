var link=function(dom) {

	var ui=Maggi({
		children:{
			o:{
				type:"link",
				label:"click here",
				target:"_blank"
			}
		},
		class:"mui"
	});

	var data=Maggi({o:"http://www.google.com"});

	Maggi.UI(dom,data,ui);
};
