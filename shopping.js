function shopping() {

	var o=Maggi({
		items:{
			apple :{id:"apple",name:"Green Apple",price:0.99},
			orange:{id:"orange",name:"Tasty Orange",price:1.79},
			banana:{id:"banana",name:"Yellow Banana",price:2.49}
		},
		cart:{
			items:{
			},
			price:0,
			pieces:0,
			text:""
		}
	});

	var updatePrice=function(k,v) {
		var p=0;
		for (var k in o.cart.items) p=p+o.cart.items[k]*o.items[k].price;
		o.cart.price=p;
	};

	var updateText=function(k) {
		var text="";
		for (var k in o.cart.items) {
			var n=o.cart.items[k];
			if (n) {
				if (text!="") text=text+", ";
				text=text+n+" "+o.items[k].name;
			}
		}
		o.cart.text=text;
	};

	var updatePieces=function() {
		var n=0;
		for (var k in o.cart.items) n=n+o.cart.items[k];
		o.cart.pieces=n;
	};

	o.cart.items.bind(["add","remove","set"],[updateText,updatePrice,updatePieces]);
	for (key in o.items) o.items[key].bind("set",[updatePrice,updateText]);
	o.cart.items.add("apple",3);
	o.cart.items.add("banana",2);

	return o;
}
