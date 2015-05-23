var html=function(dom) {

	var ui=Maggi({
		type:"object",
		children:{
			o:{type:"html"}
		},
		class:"mui"
	});

	var data=Maggi({o:"<ol><li>First<li>Second</ol>"});

	Maggi.UI(dom,data,ui);
};
