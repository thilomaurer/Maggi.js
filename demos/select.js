var select=function(dom) {
	var ui=Maggi({
		type:"object",
		children:{
			mode:{
				type:"select",
				choices:{
					on:{label:"On"},
					tri:{label:"Middle"},
					off:{label:"right"}
				}
			}
		}
	});

	var data=Maggi({mode:"on"});

	Maggi.UI(dom,data,ui);
};
