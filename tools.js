function syntaxHighlight(json) {
	if (typeof json != 'string') {
		json = JSON.stringify(json, function(k,val) {
			if (typeof val === 'function')
				return val.toString();
		  	return val;
		}, 2);
	}
	json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
	return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
		var cls = 'number';
		if (/^"/.test(match)) {
			if (/:$/.test(match)) {
				match=match.replace(/\"/g,'');
					cls = 'key';
				} else {
					cls = 'string';
				}
			} else if (/true|false/.test(match)) {
				cls = 'boolean';
			} else if (/null/.test(match)) {
			cls = 'null';
		}
		return '<span class="' + cls + '">' + match + '</span>';
	});
}

function spinner(text)
{
	var spinner = $('<div/>', {'class':'spinner'});
	for (i=1;i<13;i++) spinner.append($('<div/>', {'class':'bar'+i}));
	return(spinner);
}
