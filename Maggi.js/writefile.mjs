import fs from 'fs';
import mkdirp from 'mkdirp';
var write_s = {};

var writefile=function(filename,data,enc) {
	if (enc==null) enc="utf8";
	if (write_s[filename]==null) 
		write_s[filename]={filename:filename,data:data,enc:enc,saving:false,save_again:false};
	else { write_s[filename].data=data; write_s[filename].enc=enc; write_s[filename].save_again=true; }

	var save=function(x) {
		var dir=x.filename.substring(0,x.filename.lastIndexOf("/"));
		x.save_again=x.saving;
		if (x.saving) return;
		x.saving=true;
		var done=function(err) {
			x.saving=false;
			if (err) console.log(JSON.stringify(err));
			if (x.save_again) save(x);
		};
		mkdirp(dir,function(err) {
			if (err) done(err);
			else {
				fs.rename(x.filename,x.filename+".backup", err => {
					if (err) console.log(JSON.stringify(err));
					fs.writeFile(x.filename, x.data, x.enc, done);
				});
			}
		}); 
	};
	save(write_s[filename]);
};

export default writefile;

