
var main = function() {
	var dom=$('body');
	var m=Maggi.UI_devel(dom);
	ide_init(m);

	var ddd=new Date();
	var events={
	    ready: function() {
    		console.log("Time to ready in ms:",(new Date()).getTime()-ddd.getTime());
    		m.ui.children.connecting.visible=false;
	    },
	    disconnect: function() {
		    m.ui.children.connecting.visible=true;
	    }
	};

	m.data=Maggi.db.client("Maggi.UI.IDE",events,m.data);
	/*
	$('body').keypress(function(e) {
		var c=e.keyCode;
		if (c==32) {
			sampleprojects.pwcalc(function(project) {
				if (m.data.projects[0]==null) {
					m.data.projects.add(0,project);
					m.ui.children.projects.selected="0";
				}
			});
			sampleprojects.Maggi(function(project) {
				if (m.data.projects[1]==null) {
					m.data.projects.add(1,project);
					m.ui.children.projects.selected="1";
				}
			});
		}
	});*/
};

var sampleprojects={};

sampleprojects.Maggi=function(complete) {
	initproject(
		{name:"<nobody>",username:"username",email:"username@domain.com"},
		{name:"New Empty Project"},
		[
			"jquery.js",
			"Maggi.js/Maggi.js",
			"Maggi.js/Maggi.UI.js",
			"Maggi.js/Maggi.UI.css",
			"Maggi.js/Maggi.UI.input.css",
			"Maggi.js/Maggi.UI.select.css"
		],
		function(project) {
			project.view.panes.add(0,{fileid:0,mode:"edit"});
			project.view.panes.order=["0"];
			complete(project);
		}
	);
};

sampleprojects.pwcalc=function(complete) {
	initproject(
		{name:"Thilo Maurer",email:"tm@thilomaurer.de",username:"thilomaurer"},
		{name:"Password Calculator",icon:"lock.svg"},
		[
			["README.txt","demos/README.txt"],
			"jquery.js",
			"Maggi.js/Maggi.js",
			"Maggi.js/Maggi.UI.js",
			"Maggi.js/Maggi.UI.css",
			"Maggi.js/Maggi.UI.input.css",
			"Maggi.js/Maggi.UI.select.css",
			["pwcalc.js","demos/pwcalc.js"],
			["pwcalc.css","demos/pwcalc.css"],
			["pwcalc.html","demos/pwcalc.html"],
			["utils.js","demos/utils.js"],
			["lock.svg","demos/lock.svg"]
		],
		function(project) {
			project.view.panes.add(0,{fileid:8,mode:"edit"});
			project.view.panes.add(1,{fileid:9,mode:"edit"});
			project.view.panes.add(2,{fileid:8,mode:"preview"});
			project.view.panes.order=["0","1","2"];
			complete(project);
		}
	);
};

