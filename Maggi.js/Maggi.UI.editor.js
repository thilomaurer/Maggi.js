Maggi.UI.editor=function(dom,data,setdata,outer_ui,onDataChange) {
	
	var builder=function(dom,d,ui) {
		//console.log(outer_ui.settings);
		var annotsethandler=function(k,v) {
			if (k=="selected"&&v!=null) {
				editor.focus();
				var annot=d.annot[v];
				data.file.cursor={row:annot.row, column:annot.column};
			}
		};
		var wrapper=$("<div>").appendTo(dom.ui.doc);	
		var editor=ace.edit(wrapper[0]);
		var onresize=function() {
			editor.resize();
			editor.centerSelection();
		};
		addResizeListener(wrapper[0],onresize);
		editor.$blockScrolling = Infinity;
		var disableEvents=false; //hack to work around ACE issue.

		function updateMode() {
			var mode="text";
			if (data.file) {
				var type=data.file.type;
				if (type=="text/javascript") mode="javascript";
				if (type=="application/javascript") mode="javascript";
				if (type=="text/css") mode="css";
				if (type=="text/html") mode="html";
				if (type=="image/svg+xml") mode="svg";
				if (type=="application/json") mode="json";
			}
			editor.getSession().setMode("ace/mode/"+mode);
		}

		editor.on("change", function(e) {
			if (!disableEvents) data.file.data=editor.getValue();
		});
		editor.getSession().selection.on('changeCursor', function() {
			if (disableEvents) return;
			data.file.cursor=editor.getCursorPosition();
		});
		editor.getSession().on("changeAnnotation", function() {
			var annot=editor.getSession().getAnnotations();
			d.annot=annot.slice(0,16);
		});	

		var updateText = function() {
			var text=null;
			if (data.file) {
				text=data.file.data;
				if (editor.getValue()==text) return;
			}
			disableEvents=true; //hack to work around ACE issue.
			if (text==null) text="";
			editor.session.setValue(text);
			disableEvents=false;
		};
		var updateCursor = function() {
			if (data.file==null) return;
			var op=editor.getCursorPosition();
			var c=data.file.cursor;
			if ((c.row==op.row)&&(c.column==op.column)) return;
			disableEvents=true; //hack to work around ACE issue.
			editor.selection.setSelectionRange({start:c,end:c},false);
			if (editor.isFocused()) editor.centerSelection();
			disableEvents=false;
		};
		var updateFile = function() {
			var file=data.file;
			editor.setReadOnly(file==null);
			fmt.children.annot.selected=null;
			updateText();
			updateMode();
			updateCursor();
			editor.centerSelection();
		};
		var sethandler=function(k,v) {
			if (k=="file") updateFile(); 
			if (k[0]=="file"&&k[1]=="type") updateMode();
			if (k[0]=="file"&&k[1]=="data") updateText();
			if (k[0]=="file"&&k[1]=="cursor") updateCursor();
		};
		var setKeyboard=function(v) {
			var modes={
				gui:"",
				vim:"ace/keyboard/vim",
				emacs:"ace/keyboard/emacs"
			};
			editor.setKeyboardHandler(modes[v]);
		};
		var setTheme=function(v) {
			if (v==null) return;
			editor.setTheme("ace/theme/"+v);
		};
		var ouihandler=function(k,v) {
			if (k=="readonly") editor.setReadOnly(v);
			if (k=="settings") {
				var opt={};
				for (var attrname in v.editing) { opt[attrname] = v.editing[attrname]; }
				for (var attrname in v.ui) { opt[attrname] = v.ui[attrname]; }
				for (var attrname in v.gutter) { opt[attrname] = v.gutter[attrname]; }
				if (v.colorscheme) setTheme(v.colorscheme.day);
				setKeyboard(opt.keyboard);
				delete opt.keyboard;
				editor.setOptions(opt);
			}
			if (k[0]=="settings") {
				if (k[1]=="colorscheme") {
					if (k[2]=="day"||k[2]=="night")
						setTheme(v);
				} else if (k[2]=="keyboard") {
					setKeyboard(v);
				} else {
					var opt={};
					opt[k[2]]=v;
					editor.setOptions(opt);
				}
			}
		};
		data.bind(sethandler);
		outer_ui.bind(ouihandler);
		fmt.children.annot.bind(annotsethandler);
		setTheme("xcode");
		updateFile();
		ouihandler("readonly",outer_ui.readonly);
		ouihandler("settings",outer_ui.settings);
		return function() {
			data.unbind(sethandler);
			outer_ui.unbind(ouihandler);
			fmt.children.annot.unbind(annotsethandler);
			editor.destroy();
		};
	};
	
	var d=Maggi({editor:"",annot:{}});
	var fmt=Maggi({
		children: {
			doc:{},
			annot:{
				wrap:true,
				type:"list",
				childdefault:{
					childdefault:"text",
					order:["type","row","column","text"],
					builder:function(dom,data) {
						dom.addClass(data.type);
					}
				},
				select:"single",
				selected:null, 
				class:"scroll"
			}
		},
		builder:builder,
		class:"editor flexrows"
	});
	return Maggi.UI(dom,d,fmt);
};
