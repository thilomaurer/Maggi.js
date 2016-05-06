	var uiui={
		type:"object",
		children:{
			visible:{type:"bool"},
			enabled:{type:"bool"},
			onReturn:{type:"input",kind:"txt",class:"code",autosize:true},
			children:{type:"object",childdefault:{type:"uiui"},makechildlabels:true},
			childdefault:{type:"object",childdefault:{type:"input",autosize:true,kind:"text",class:"text"},makechildlabels:true},
			order:{type:"object",childdefault:{type:"input",autosize:true,kind:"text",class:"text"},makechildlabels:true},
			headerui:{type:"uiui"},
			headerdata:{type:"object",childdefault:{type:"input",autosize:true,kind:"text",class:"text"},makechildlabels:true}
		},
		childdefault:{type:"input",autosize:true,kind:"text",class:"text"},
		class:"uimodel-ui",
		makechildlabels:true
	};
	Maggi.UI.uiui=function(ui,v,setv,format) {
		if (!ui._Maggi) { 
			Maggi.UI(ui,v,uiui,setv);
		}
	}
	var dataui={
		type:"object",
		class:"uimodel-ui",
		childdefault:{type:"input",autosize:true,kind:"text",class:"text"},
		makechildlabels:true
	};
	Maggi.UI.dataui=function(ui,v,setv,format) {
		if (!ui._Maggi) { 
			Maggi.UI(ui,v,dataui,setv);
		}
	}
/*
Maggi.UI.bool=function(ui,v,setv,format) {
	if (!ui._Maggi) {
		Maggi.UI.BaseFunctionality(ui,format);
	ui.click(function() { setv(!v); });
	} 
	ui.text(v);
};
*/
