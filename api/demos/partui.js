var partui=function(m,dom) {
	$("html").addClass("mui");
	
	m.data=Maggi.UI.parts.input;
	m.ui={
		parts:"children",
		childdefault:"text",
		children:{
		    caption:"text",
		    description:"text",
		    name:{parts:"text",format:"part name: %s"},
		    parts:{parts:"text",format:"inherits parts: %s",},
		    partclass:{parts:"text",format:"adds CSS classes: %s"},
		    members:{parts:"text",format:"has %d members:",map:function(o){ return Object.keys(o).length;}},
		    bindings:{parts:"text",format:"has %d bindings",map:function(o){ return Object.keys(o).length;}},
		    builder:{parts:"text",format:"has %s builder",map:function(o){ return (o&&"a")||"no";}},
		    member_description:{parts:"children",childdefault:memberdesc},
		},
		order:["caption","description","name","parts","partclass","members","bindings","builder","member_description"]
	};

};

var memberdesc=function() {
    return {
        parts:"children",
        children:{
            caption:"text",
            description:"text",
            type:{parts:"text",format:"type: %s"},
            default:{parts:"text",format:"default value: %s"},
            example:{parts:"text",format:"example value: %s"},
        },
        order:["caption","description","type","default","example"]
    };
};

