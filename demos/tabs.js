var tabs=function(dom) {

	var ui=Maggi({
		type:"tabs",
		headerui:{},
		headerdata:{
			child1:"Header 1",
			child2:"Header 2",
			child3:"Header 3"
		},
		selected:"child2",
		class:"mui"
	});

	var data=Maggi({
		child1:"element1",
		child2:"element2",
		child3:"element3"
	});

	Maggi.UI(dom,data,ui);
};
