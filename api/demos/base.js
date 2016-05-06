var base=function(m) {
	m.data={
		child:"child-content",
	};

	m.ui={
		visible:true,
		enabled:false,
		class:"mui",
		builder:function(dom,data,ui) {
		    dom.prepend($('<div>',{text:"prepended"}));
		    data.child="child-content-modified";
		}
	};
};
