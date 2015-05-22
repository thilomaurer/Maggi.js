var object=function(dom) {

	var data=Maggi({

		child1:"child 1",
		child2:"child 2",
		child3:{
			child31:"child 3.1",
			child32:"child 3.2"
		}
	});

	var ui=Maggi({
		type:"object",
		//childdefault:"text",
		//children:{child1:"text",child2:"input"},
		order:[	
			"child3",
			"child2",
			"child1"
		]
	});

	Maggi.UI(dom,data,ui);
};
