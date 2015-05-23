var text=function(dom) {

	var ui=Maggi({
		type:"object",
		children:{
			pi:{
				type:"text",
				format:"more than %04.20f rounds"
			},
			ints:{
				type:"text",
				format:"first %d, then %d, last %d"
			}

		},
		class:"mui"
	});

	var data=Maggi({
		pi:3.1415926,
		ints:[0,2,3]
	});

	Maggi.UI(dom,data,ui);
};
