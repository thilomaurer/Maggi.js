var object=function(m) {

	m.data={
		child1:"child 1",
		child2:"child 2",
		child3:{
			child31:"child 3.1",
			child32:"child 3.2"
		}
	};

	m.ui={
		childdefault:"text",
		//children:{child3:{childdefault:"text"},child2:"input"},
		order:[	
			"child3",
			"child2",
			"child1"
		],
		class:"mui showhierarchy"
	};
};
