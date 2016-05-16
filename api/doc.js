var doc = function() {

        var dom=$('#ide');
        var m=Maggi.UI_devel(dom);
        ide_init(m);
	m.ui.offline=true;
	m.ui.showheader=false;
	
	var sources={
		base:{name:"Base", srcs: ["demos/base.js","demos/my.css"]},
		object:{name:"Object", srcs: ["demos/object.js","demos/my.css"]},
		text:{name:"Text", srcs: ["demos/text.js","demos/my.css","ide/Maggi.js/sprintf.js"]},
		html:{name:"HTML", srcs: ["demos/html.js","demos/my.css"]},
		function:{name:"Function", srcs: ["demos/func.js","demos/my.css"]},
		input:{name:"Input", srcs: ["demos/input.js","demos/my.css"]},
		link:{name:"Link", srcs: ["demos/link.js","demos/my.css"]},
		checkbox:{name:"Checkbox", srcs: ["demos/checkbox.js","demos/my.css"]},
		list:{name:"List", srcs: ["demos/list.js","demos/my.css"]},
		tabs:{name:"Tabs", srcs: ["demos/tabs.js","demos/my.css"]},
		select:{name:"Select", srcs: ["demos/select.js","demos/my.css"]},
		demo:{name:"Password Calculator", srcs: ["demos/pwcalc.js","demos/pwcalc.css","demos/pwcalc.html","demos/utils.js"]},
		part:{name:"Part", srcs: ["demos/partui.js","demos/partui.css"]},
	};

	$.each(sources,function(k,v) {
		var x=sources[k];
		if (x==null) return;
		var files=["ide/jquery.js","Maggi.js/Maggi.js","Maggi.js/Maggi.UI.js","Maggi.js/Maggi.UI.css","Maggi.js/sprintf.js","demos/partui.js","demos/partui.css"];
		files=x.srcs.concat(files);

		initproject(
			{name:"<nobody>",username:"username",email:"username@domain.com"},
			{name:x.name},files,
			function(project) {
				var fid=project.addfile({name:"part_description.js",type:"application/javascript",data:"var part_description=function(m) {\n\tm.data=Maggi.UI.parts."+k+";\n\tm.ui=partui.ui;\n\t$('html').addClass('mui');\n};\n"});
				project.options.colorscheme="dark";
				project.view.panes.add(0,{fileid:fid,mode:"preview",showheader:false});
				project.view.panes.add(1,{fileid:1,mode:"edit"});
				project.view.panes.add(2,{fileid:1,mode:"preview"});
				project.view.panes.order=[0,1,2];
				var rev=project.revisions[0];
		    		projectfuncs(project).branch(rev)();
				m.data.projects.add(k,project);
			}
		);
	});
};
