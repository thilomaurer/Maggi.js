var partui=function(m,dom) {
	$("html").addClass("mui");
	m.data=Maggi.UI.parts.input;
	m.ui=partui.ui;
};

partui.ui=function() {
	return {
		parts:"children",
		childdefault:"text",
		children:{
			caption:"text",
			description:"text",
			name:{parts:"text",format:"part name: %s"},
			parts:{parts:"text",format:"inherits: %s",},
			partclass:{parts:"text",format:"adds classes: %s"},
			members:{parts:"text",format:"%d members:",map:function(o){ return Object.keys(o).length;}},
			bindings:{parts:"text",format:"%d bindings, ",map:function(o){ return Object.keys(o).length;}},
			builder:{parts:"text",format:"Has %s builder, ",map:function(o){ return (o&&"a")||"no";}},
			member_description:{parts:"children",childdefault:partui.ui.member},
		},
		order:["caption","description","name","parts","partclass","builder","bindings","members","member_description"],
		class:"partui"
	};
};

partui.ui.member=function() {
    return {
        parts:"children",
        children:{
            caption:"text",
            description:"text",
            name:{parts:"text",format:"name: %s"},
            type:{parts:"text",format:"type: %s"},
            default:{parts:"label",label:""},
            example:{parts:"text",format:"example: %s"},
        },
        order:["caption","description","name","type","default","example"],
        builder(m) {
            var def=JSON.stringify(Maggi.UI.parts.input.members[m.data.name]);
            m.ui.children.default.label="default: "+def;
        },
        class:"memberdesc"
    };
};


