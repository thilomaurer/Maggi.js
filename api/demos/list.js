var list=function(dom) {

	var ui=Maggi({
		type:"list",
		select:"multi",
		selected:{"child2":true},
		class:"mui selectable"
	});

	var data=Maggi({
		child1:"element1",
		child2:"element2",
		child3:"element3"
	});

	Maggi.UI(dom,data,ui);
}