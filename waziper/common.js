const mysql = require('mysql');
const config = require("./../config.js");
const moment = require('moment-timezone');
const db_connect = mysql.createPool(config.database);


const Common = {
	db_query: async function(query, row){
		var res = await new Promise( async (resolve, reject)=>{
	        db_connect.query( query, (err, res)=>{
	            return resolve(res, true);
	        });
	    });

		return Common.response(res, row);
	},

	db_insert: async function(table, data){
		var res = await new Promise( async (resolve, reject)=>{
	        db_connect.query( "INSERT INTO "+table+" SET ?", data,  (err, res)=>{
	            return resolve(res, true);
	        });
	    });

		return res;
	},

	db_update: async function(table, data){
		var res = await new Promise( async (resolve, reject)=>{
	        db_connect.query( "UPDATE "+table+" SET ? WHERE ?", data, (err, res)=>{
	            return resolve(res, true);
	        });
	    });

		return res;
	},

	db_get: async function(table, data){
		var query = "SELECT * FROM "+table+" ";
		var where = "";
		if(data.length > 0){
			for (var i = 0; i < data.length; i++) {
				if(i == 0){
					where = where + " ?";
				}else{
					where = where + " AND ?";
				}
			}
		}

		if(where != ""){
			query = query + " WHERE " + where;
		}

		var res = await new Promise( async (resolve, reject)=> {
	        db_connect.query(query , data, (err, res)=>{
	            return resolve(res);
	        });
	    });

		return Common.response(res, true);
	},

	db_fetch: async function(table, data){
		var query = "SELECT * FROM "+table+" ";
		var where = "";
		if(data.length > 0){
			for (var i = 0; i < data.length; i++) {
				if(i == 0){
					where = where + " ?";
				}else{
					where = where + " AND ?";
				}
			}
		}

		if(where != ""){
			query = query + " WHERE " + where;
		}

		var res = await new Promise( async (resolve, reject)=> {
	        db_connect.query(query , data, (err, res)=>{
	            return resolve(res);
	        });
	    });

		return Common.response(res, false);
	},

	db_delete: async function(table, data){
		var query = "DELETE FROM "+table+" ";
		var where = "";
		if(data.length > 0){
			for (var i = 0; i < data.length; i++) {
				if(i == 0){
					where = where + " ?";
				}else{
					where = where + " AND ?";
				}
			}
		}

		if(where != ""){
			query = query + " WHERE " + where;
		}

		var res = await new Promise( async (resolve, reject)=>{
	        db_connect.query( query, data, (err, res)=>{
	            return resolve(res, true);
	        });
	    });

		return res;
	},

	get_phone_number: async function(contact_id, phone_numbers){
		var res = await new Promise( async (resolve, reject)=>{
	        db_connect.query( `SELECT *  FROM sp_whatsapp_phone_numbers WHERE pid = '`+contact_id+`' AND phone NOT IN( ? ) LIMIT 5`, [ phone_numbers ],  (err, res)=>{
	            return resolve(res);
	        });
	    });
		return Common.response(res, true);
	},

	get_instance: async function(instance_id){
		var res = await new Promise( async (resolve, reject)=>{
			var data = [{
				instance_id: instance_id
			}];

	        db_connect.query( "SELECT * FROM sp_whatsapp_sessions WHERE ?", data,  (err, res)=>{
	            return resolve(res);
	        });
	    });
		return Common.response(res, true);
	},

	get_accounts: async function(accounts){
		var res = await new Promise( async (resolve, reject)=>{
	        db_connect.query( "SELECT count(*) as count FROM sp_accounts WHERE id IN  ("+accounts+") AND status = 1",  (err, res)=>{
	            return resolve(res);
	        });
	    });
		return Common.response(res, true);
	},

	update_status_instance: async function(instance_id, info){
		var res = await new Promise( async (resolve, reject)=>{
			var data = [{
				status: 1,
				data: JSON.stringify(info)
			},{
				instance_id: instance_id
			}];

	        db_connect.query( "UPDATE sp_whatsapp_sessions SET ? WHERE ?", data,  (err, res)=>{
	            return resolve(res, true);
	        });
	    });

		return res;
	},

	db_insert_account: async function(instance_id, team_id, wa_info){
		var res = await new Promise( async (resolve, reject)=>{
			var data  = {
				ids: Common.makeid(13),
				module: 'whatsapp_profiles',
				social_network: 'whatsapp',
				category: 'profile',
				login_type: 2,
				can_post: 0,
				team_id: team_id,
				pid: Common.get_phone(wa_info.id, 'wid'),
				name: wa_info.name,
				username: Common.get_phone(wa_info.id),
				token: instance_id,
				avatar: wa_info.avatar,
				url: 'https://web.whatsapp.com/',
				tmp: JSON.stringify(wa_info),
				status: 1,
				changed: Common.time(),
				created: Common.time()
			};

	        db_connect.query( "INSERT INTO sp_accounts SET ?", data,  (err, res)=>{
	            return resolve(res, true);
	        });
	    });

		return res;
	},

	db_update_account: async function(instance_id, team_id, wa_info, account_id){
		var res = await new Promise( async (resolve, reject)=>{
			var data  = [{
				pid: Common.get_phone(wa_info.id, 'wid'),
				name: wa_info.name,
				username: Common.get_phone(wa_info.id),
				token: instance_id,
				avatar: wa_info.avatar,
				tmp: JSON.stringify(wa_info),
				status: 1,
				changed: Common.time(),
			},{
				id: account_id
			}];

	        db_connect.query( "UPDATE sp_accounts SET ? WHERE ?", data,  (err, res)=>{
	            return resolve(res, true);
	        });
	    });

		return res;
	},

	db_insert_stats: async function(team_id){
		var res = await new Promise( async (resolve, reject)=>{
			var data  = {
				ids: Common.makeid(13),
				team_id: team_id,
				wa_total_sent_by_month: 0,
				wa_total_sent: 0,
				wa_chatbot_count: 0,
				wa_autoresponder_count: 0,
				wa_api_count: 0,
				wa_bulk_total_count: 0,
				wa_bulk_sent_count: 0,
				wa_bulk_failed_count: 0,
				wa_time_reset: 0,
				next_update: 0
			};

	        db_connect.query( "INSERT INTO sp_whatsapp_stats SET ?", data,  (err, res)=>{
	            return resolve(res, true);
	        });
	    });

		return res;
	},

	db_insert_stats: async function(team_id){
		var res = await new Promise( async (resolve, reject)=>{
			var data  = {
				ids: Common.makeid(13),
				team_id: team_id,
				wa_total_sent_by_month: 0,
				wa_total_sent: 0,
				wa_chatbot_count: 0,
				wa_autoresponder_count: 0,
				wa_api_count: 0,
				wa_bulk_total_count: 0,
				wa_bulk_sent_count: 0,
				wa_bulk_failed_count: 0,
				wa_time_reset: 0,
				next_update: 0
			};

	        db_connect.query( "INSERT INTO sp_whatsapp_stats SET ?", data,  (err, res)=>{
	            return resolve(res, true);
	        });
	    });

		return res;
	},

	response: async function(res, row){
		if(res != undefined && res.length > 0){
			if(row || row == undefined){
				return res[0];
			}else{
				return res;
			}
			
		} 
		return false;
	},

	check_especials: function (phone) {
        return new Promise((resolve, reject) => {
            var updateQuery = '';
            var current_phone = phone;

            if (phone != '') {

                if (phone.startsWith('55')) {

                    var ddd = phone.substring(2, 4);

                    if (ddd >= 31 && phone.length >= 13) {
                        phone = phone.substring(0, 4) + phone.substring(5, phone.length);
                    }
                }else{
                	resolve(phone);
                }

                if (phone.startsWith('52') && phone.length == 12 && phone.substring(2, 3) != '1') {
                    phone = phone.substring(0, 2) + '1' + phone.substring(2, phone.length);
                }

                if(phone != current_phone){
                	updateQuery = "UPDATE `sp_whatsapp_phone_numbers` SET  `phone`='" + phone + "'  WHERE `phone`=" + current_phone;
	                db_connect.query(updateQuery, function (f, s) {
	                    if (f) console.error(f);
	                    resolve(phone);
	                });
                }else{
                	resolve(phone);
                }
            } else {
                resolve(phone);
            }
        });
    },

	makeid: function(length) {
	    let result = '';
	    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	    const charactersLength = characters.length;
	    let counter = 0;
	    while (counter < length) {
	      result += characters.charAt(Math.floor(Math.random() * charactersLength));
	      counter += 1;
	    }
	    return result.toLowerCase();
	},

	time: function(length) {
	    return Math.round( new Date().getTime()/1000 );
	},

	randomIntFromInterval: function(min, max) {
	  return Math.floor(Math.random() * (max - min + 1) + min)
	},

	get_avatar: function(text, color){
		if(text != undefined){
	        if(color == undefined){
	           	var colors = [
	                "E74645",
	                "FB7756",
	                "FACD60",
	                "12492F",
	                "F7A400",
	                "58B368"
	            ];

	            var random = Math.floor(Math.random() * colors.length);
				color =  colors[random];
	        }

	        text = text.replace("&", "");
	        text = text.replace("&amp;", "");
	        text = text.replace("=", "");
	        text = text.replace("&quot", "");
	        text = text.replace("\"", "");
	        text = text.replace("'", "");
	        text = text.replace("~", "");
	        text = text.replace(" ", "");

	        return "https://ui-avatars.com/api/?name="+encodeURI(text)+"&background="+color+"&color=fff&font-size=0.5&rounded=false&format=png";
		}

		return false;
	},

	get_phone: function(id, type){
		switch(type){

			case 'wid':

				id = id.split(":");

				if(id.length == 2){
					id1 = id[0];
					id2 = id[1];

					id2 = id2.split("@");

					id = id1 + "@" + id2[1];
				}else{
					id = id;
				}

				break;

			default:

				id = id.split(":");

				if(id.length == 2){
					id = id[0];
				}else{
					id = id.split("@");
					id = id[0];
				}

				break;
		}

		return id;
	},

	roundMinutes: function(date) {
		date.setHours(date.getHours() + 1);
	    date.setMinutes(0, 0, 0);
	    return date;
	},

	getTZDiff: function(timezone) {
		var now = moment();
		var localOffset = now.utcOffset();
		now.tz(timezone);
		var centralOffset = now.utcOffset();
		var diffInMinutes = localOffset - centralOffset;
		return diffInMinutes/60;
	},

	convert_timezone: function(date, tzString) {
    	return new Date((typeof date === "string" ? new Date(date) : date).toLocaleString("en-US", {timeZone: tzString}));   
	},

	sleep: async function (ms) {
	  return new Promise((resolve) => {
	    setTimeout(resolve, ms);
	  });
	},

	params: function(params, content){
		if(params != "" && params != undefined && params != null){
			params = JSON.parse(params);
			var params = Common.toLowerKeys(params);
			var PARAMS_PATTERN = /\%(.*?)\%/;
	    	var match;

	    	var count = 0;

	        while(match = content.match(PARAMS_PATTERN)){
	            match = match[0];
	            var find = match.substring(1,match.length-1);
	            find = find.toLowerCase();
	            if(params[find] != undefined){
	            	var change = params[find];
	            	content = content.replace( match , change );
	            }

	            count++;

	            if(count == 100){
	            	break;
	            }
	        }
	    }

		return content;
	},

	toLowerKeys: function(obj) {
	  return Object.keys(obj).reduce((accumulator, key) => {
	    accumulator[key.toLowerCase()] = obj[key];
	    return accumulator;
	  }, {});
	},

	get_url_extension: function( url ) {
	    return url.split(/[#?]/)[0].split('.').pop().trim();
	},

	ext2mime: function( url ) {
	    var mime = Common.get_url_extension( url );
		var mimetypes = {
			"jpg": "image/jpeg",
			"png": "image/png",
			"mp4": "video/mp4",
			"mp3": "audio/mpeg",
			"ogg": "audio/ogg",
			"jpeg": "image/jpeg",
			"pdf": "application/pdf",
			"ogg": "audio/ogg",
			"gif": "image/gif",
			"webp": "image/webp"
		}

		return mimetypes[mime];
	},

	get_file_name: function( url ) {
	    var filename = url.substring(url.lastIndexOf('/')+1);
		return decodeURI(filename);
	},

	post_type: function( mime , type) {

		var post_type = "documentMessage";
	    
		if( type == 1 ){
		  	if( 
		  		mime == "image/png" || 
		  		mime == "image/jpeg" || 
		  		mime == "image/jpg" || 
		  		mime == "image/gif"
		  	){
		  		post_type = "imageMessage";
		  	}else if(
		  		mime == "video/mp4" || 
		  		mime == "video/3gpp" || 
		  		mime == "video/gif" 
		  	){
		  		post_type = "videoMessage";
		  	}else if(
		  		mime == "audio/mpeg",
		  		mime == "audio/ogg"
		  	){
		  		post_type = "audioMessage";
		  	}
		  	
		}else{
			var post_type = "documentMessage";

            if( 
		  		mime == "png" || 
		  		mime == "jpeg" || 
		  		mime == "jpg" || 
		  		mime == "gif"

		  	){
		  		post_type = "imageMessage";
		  	}else if(
		  		mime == "mp4" || 
		  		mime == "3gpp" 
		  	){
		  		post_type = "videoMessage";
		  	}else if(
		  		mime == "mp3" || 
		  		mime == "ogg"
		  	){
		  		post_type = "audioMessage";
		  	}
		}

		return post_type;
	},
}
module.exports = Common; 