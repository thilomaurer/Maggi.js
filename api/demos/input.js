var input=function(m,dom) {
	$("html").addClass("mui");
	
	m.data="";
	m.ui={
		parts:"input",
		placeholder:"name@domain",
		kind:"email",
		autosize:false,
		onReturnKey:function(v) { alert(v); }
	};

};
