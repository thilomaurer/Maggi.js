var func=function(dom) {

	var data=Maggi({
		myfunc:function() { alert("alert"); }
	});

	var ui=Maggi({
		type:"object",
		children:{
			myfunc:{
				type:"function",
				label:"label"
			}
		}
	});

	Maggi.UI(dom,data,ui);
};
