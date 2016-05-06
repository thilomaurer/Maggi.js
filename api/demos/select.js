var select=function(dom) {
	var ui=Maggi({
		children:{
			mode:{
				type:"select",
				choices:{
					on:{label:"On"},
					tri:{label:"Tri-State"},
					off:{label:"Off"}
				}
			}
		},
		class:"mui"
	});

	var data=Maggi({
		mode:"on"
	});

	Maggi.UI(dom,data,ui);
};
