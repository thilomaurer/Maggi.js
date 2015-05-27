var pwcalc=function(dom) {
	m=Maggi.UI_devel(dom);

	m.data={
		alias:"",
		secret:"",
		len:16,
		password:""
	};

	m.data.bind("set",["alias","secret","len"],function(k,v) {
		m.data.password=calcPassword(m.data.alias,m.data.secret);
	});

	var calcPassword = function(alias,secret) {
		if (secret===""||alias==="") return "";
		var array = Sha1.hash(secret + alias).match(/.{1,2}/g);
		for (var i in array) array[i] = parseInt(array[i], 16);
		return btoa(String.fromCharCode.apply(null, array)).substring(0,m.data.len);
	};

	m.ui={
		children: {
			header: {type:"label", label:"Password Calculator"},
			len: {type:"select", choices:{"8":"8 chars","16":"16 chars","32":"32 chars"}},
			alias:  {type:"input", placeholder:"alias", class:"first"},
			secret: {type:"input", placeholder:"secret", kind:"password"},
			password: "text"
		},
		class:"pwcalc mui"
	};

};

/*
var pwcalc=function(dom) {
	var data=Maggi({
		alias:"",
		secret:"",
		password:""
	});

	data.bind("set",["alias","secret"],function(k,v) {
		data.password=calcPassword(data.alias,data.secret);
	});

	var calcPassword = function(alias,secret) {
		if (secret===""||alias==="") return "";
		var array = Sha1.hash(secret + alias).match(/.{1,2}/g);
		for (var i in array) array[i] = parseInt(array[i], 16);
		return btoa(String.fromCharCode.apply(null, array));
	};

	var ui=Maggi({
		X,
		children: {
			header: {type:"label", label:"Password Calculator"},
			alias:  {type:"input", placeholder:"alias", class:"first"},
			secret: {type:"input", placeholder:"secret", kind:"password"},
			password: "text"
		},
		class:"mui"
	});

	Maggi.UI(dom,data,ui);
};
*/
