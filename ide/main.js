var main = function() {

	var d=ide($('body'));
	initproject("Thilo Maurer","username@domain","Password Calculator",[
		"jquery-2.0.3.js",
		"Maggi.js",
		"Maggi.UI.js",
		"Maggi.UI.css",
		"demos/pwcalc.js",
		"demos/pwcalc.css",
		"demos/pwcalc.html",
		"demos/utils.js"],
		function(project) {
			project.view.panes[0].fileid=4;
			project.view.panes[1].fileid=4;
			d.projects.add(0,project);
			d.project=project;
		}
	);
}