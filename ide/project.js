var project=function() {
	var data=Maggi({
		revisions:{
			0:{
				revision:0,
				name:null,
				started:new Date(),
				completed:null,
				committer:null,
				parentrevision:null,
				files:[]
			}
		},
		freefileid: 0,
		view:{
			revision:0,
			panes:{/*
				1:{fileid:4,mode:"edit"},
				2:{fileid:6,mode:"preview"}*/
			}
		},
		user: {
			name:null,
			email:null
		},
		addfile: function(file) {
		        var fileid=data.freefileid++;
			var revid=data.view.revision;
			data.revisions[revid].files.add(fileid,file);
			return fileid;
		},
		branch: function(fromid) {
			if (fromid==null) fromid=data.view.revision;
			var fromrev=data.revisions[fromid];
			var newid=Object.keys(data.revisions).length;
			var newrev={
				revision:newid,
				name:fromrev.name,
				started:new Date(),
				completed:null,
				committer:null,
				parentrevision:fromid,
				files:JSON.parse(JSON.stringify(fromrev.files))
			};
			data.revisions.add(newid,newrev);
			data.view.revision=newid;
			return newid;
		},
		commit: function(id) {
			if (id==null) id=data.view.revision;
			var rev=data.revisions[id];
			if (rev.completed) { alert("Error: Revision "+id+" already committed earlier."); return; }
			rev.completed=new Date();
			rev.committer=data.user;
		},
		commitnbranch:function() {
			data.commit();
			return data.branch();
		}
	});
	return data;
};


var projectui=function() {
	return {
		type:"object",
		children:{
			view: {type:"object",children:{revision:{type:"text"}}},
			revisions:{
				type:"list",
				popup:true,
				popuptrigger:"view",
				childdefault:{
					type:"object",
					children:{
						revision:{type:"text"}
					}
				},
				select:"single",
				selected:null
			},
			commitnbranch: {type:"function",label:"commit revision",class:"button blue"},
		},
		class:"project",
		builder:function(dom,data,ui) {
			revsethandler=function(k,v) {
				if (k=="selected") { ui.children.revisions.visible=false; data.view.revision=v; }
			};		
			ui.children.revisions.bind(revsethandler);
			return function() {
				ui.children.revisions.unbind(revsethandler);
			}
		}
	};
}

var projectui_info=function() {
	return {
		type:"object",
		children:{
			//name: {type:"text"},
			//view: {type:"object",children:{revision:{type:"text"}}},
		},
		class:"project_info",
		builder:function(dom,data,ui) {
			var rev=data.view.revision;
			var name=data.revisions[rev].name;
			var d=Maggi({name:name,date:new Date()});
			Maggi.UI(dom,d,{type:"object",children:{name:{type:"text"}/*,date:{type:"text"}*/}});
		}
	};
}



var initproject=function(username,email,name,sources,complete) {
	var data=project();
	var rev=0;
	data.user.name=username;
	data.user.email=email;
	data.revisions[rev].name=name;
	rev=data.commitnbranch();

	var files=data.revisions[rev].files;
	var nfloaded=0;
	$.each(sources, function(idx,k) {
		var parts=k.split(".");
		var type="text";
		if (parts.length>0) type=parts[parts.length-1];
		var file=Maggi({name:k,type:type,data:null,cursor:{row:0,column:0}});
		data.addfile(file);
		$.get( k, null, function(rawdata) {
			file.data=rawdata;
			nfloaded++;
			if (nfloaded==sources.length) filesloaded();
		},"text");
	});

	var filesloaded = function() {
		data.commitnbranch();
		data.view.panes.add(0,{fileid:0,mode:"edit"});
		data.view.panes.add(1,{fileid:1,mode:"edit"});
		data.view.panes.add(2,{fileid:0,mode:"preview"});
		complete(data);
	}
};

