var data=Maggi({
	child1:"element1",
	child2:"element2",
	child3:"element3"
});

var ui=Maggi({
	type:"object",
	visible:true,
	enabled:false,
	class:"myclass"
});

Maggi.UI($('body'),data,ui);
