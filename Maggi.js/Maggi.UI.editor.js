Maggi.UI.editor=function(dom,data,setdata,ui,onDataChange) {
	
	var builder=function(dom,d,ui) {

		var annotsethandler=function(k,v) {
			if (k=="selected") { 
				var annot=d.annot[v];
				data.file.cursor={row:annot.row, column:annot.column};
			}
		};
		
		var editor=ace.edit(dom.ui.doc[0].children[0]);
		editor.setTheme("ace/theme/xcode");

		var disableEvents=false; //hack to work around ACE issue.

		function updateMode() {
		    /*
		    var mime="text";
		    if (data.file) mime=data.file.type;
			editor.getSession().setMode(mime);
			*/
			
			var mode="text";
			if (data.file) {
				var type=data.file.type;
				if (type=="text/javascript") mode="javascript";
				if (type=="text/css") mode="css";
				if (type=="text/html") mode="html";
				if (type=="image/svg+xml") mode="svg";
			}
			editor.getSession().setMode("ace/mode/"+mode);
			
		}

		editor.on("change", function(e) {
			if (!disableEvents) data.file.data=editor.getValue();
		});
		editor.getSession().selection.on('changeCursor', function() {
			if (!disableEvents) data.file.cursor=editor.getCursorPosition();
		});
		editor.getSession().on("changeAnnotation", function() {
			d.annot = editor.getSession().getAnnotations();
		});	

		var updateText = function() {
			var text=null;
			if (data.file) {
				text=data.file.data;
				if (editor.getValue()==text) return;
			}
			disableEvents=true; //hack to work around ACE issue.
			if (text==null) text="";
		    editor.setValue(text);
			disableEvents=false;
		};
		var updateCursor = function() {
			if (data.file==null) return;
			var op=editor.getCursorPosition();
			var c=data.file.cursor;
			if ((c.row==op.row)&&(c.column==op.column)) return;
			disableEvents=true; //hack to work around ACE issue.
			editor.selection.setSelectionRange({start:c,end:c},false);
			disableEvents=false;
		};
		var updateFile = function() {
			var file=data.file;
			editor.setReadOnly(file==null);
			updateText();
			updateMode();
			updateCursor();
		};
		var sethandler=function(k,v) {
			if (k=="file") updateFile(); 
			if (k[0]=="file"&&k[1]=="type") updateMode();
			if (k[0]=="file"&&k[1]=="data") updateText();
			if (k[0]=="file"&&k[1]=="cursor") updateCursor();
		};
		data.bind(sethandler);
		fmt.children.annot.bind(annotsethandler);
		updateFile();
		return function() {
			data.unbind(sethandler);
			fmt.children.annot.unbind(annotsethandler);
			editor.destroy();
		}
	};
	
	var d=Maggi({editor:"",annot:{}});
	var fmt=Maggi({
		wrap:true,
		children: {
			doc:{wrap:true},
			annot:{
			    wrap:true,
				type:"list",
				childdefault:{
				    childdefault:"text",
					order:["type","row","column","text"],
					builder:function(dom,data,ui) {
						dom.addClass(data.type);
					}
				},
				select:"single",
				selected:null, 
				class:"scroll"
			}
		},
		builder:builder,
		class:"editor tablerows expand"
	});
	return Maggi.UI(dom,d,fmt);
};
