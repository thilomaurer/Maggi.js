requirejs.config({
	paths: {
		"jquery": 'node_modules/jquery/dist/jquery',
		"socket.io": 'node_modules/socket.io/node_modules/socket.io-client/socket.io',
		"ace": 'node_modules/ace-editor-builds/src-noconflict/ace',
		"Maggi": 'node_modules/Maggi.js/Maggi',
		"sprintf": 'node_modules/Maggi.js/sprintf',
		"Maggi.UI": 'node_modules/Maggi.js/Maggi.UI',
		"Maggi.UI.editor": 'node_modules/Maggi.js/Maggi.UI.editor',
		"Maggi.UI.iframe": 'node_modules/Maggi.js/Maggi.UI.iframe',
		"Maggi.UI.overlay": 'node_modules/Maggi.js/Maggi.UI.overlay',
	},
	"shim": {
		"hidedefine": {
			exports: 'unhidedefine',
			init:function() {
				//console.log(define);
			}
		},
		"socket.io": {
			deps:["hidedefine"],
     			exports: 'io',
			init:function() {
				//console.log(unhidedefine);
				unhidedefine();
			}
    		},
		"Maggi": {
			deps:["socket.io"],
			exports: "Maggi"
		},
		"Maggi.UI": {
			deps: ["Maggi","jquery","sprintf"],
			exports: "Maggi",
		},
		"project": ["Maggi.UI"],
		"Maggi.UI.editor": ["Maggi.UI","ace"],
		"Maggi.UI.iframe": ["Maggi.UI"],
		"Maggi.UI.overlay": ["Maggi.UI"],
		"main": {
			deps: ["Maggi.UI","Maggi.UI.editor","Maggi.UI.iframe","Maggi.UI.overlay","project","pane","panes","ide","list","file","files","prj"],
			exports: "main"
		}
	}
});

requirejs(["main"],function(main) { main(); });
