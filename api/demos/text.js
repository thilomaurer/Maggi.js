var text=function(m) {
	
	m.data={
		pi:3.1415926,
		ints:[0,2,3]
	};

	m.ui={
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
	};

};