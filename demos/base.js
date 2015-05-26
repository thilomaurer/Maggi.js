var base=function(dom) {
	var data=Maggi({
		child:"child-content",
	});

	var ui=Maggi({
		visible:true,
		enabled:false,
		class:"mui",
		builder:function(dom,data,ui) {
		    dom.prepend($('<div>',{text:"prepended"}));
		    data.child="child-content-modified";
		}
	});

	Maggi.UI(dom,data,ui);
};
