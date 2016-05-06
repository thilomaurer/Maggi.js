var func=function(dom) {

	var data=Maggi({
		myfunc:function() { alert("alert"); }
	});

	var ui=Maggi({
		children:{
			myfunc:{
				type:"function",
				label:"label",
				class:"button red"
			}
		},
		class:"mui"
	});

	Maggi.UI(dom,data,ui);
};
