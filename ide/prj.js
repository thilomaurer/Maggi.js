var prj=function(m,dom) {
	sampleprojects.Maggi(function(project) {
		m.data=project;
		m.ui=prjui;
		dom.addClass("mui-light expand");
	});
};

var prjui=function() {
	return {
		children:{
			project: projectui,
			view: {
				children:{
					panes:null
				},
				class:"rows visibilityanimate"
			}
		},
		connector:null,
		actions:null,
		class:"prj rows",
		builder:function(dom,data,ui) {
			if (ui.data!=null) return;
			ui.add("data",{
				project: data,
				view: data.view
			});
			ui.children.view.children.panes=panesui(data);
			ui.bind("set","connector",function(k,v) {
			    ui.children.project.children.connector=ui.connector;
			});
			ui.bind("set","actions",function(k,v) {
				ui.children.project.children.prjjson_actions.children.actions=ui.actions;
			});
		}
	};
};
