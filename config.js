var config = {
	debug: false,
	database: {
	    connectionLimit: 500,
	    host: "sp_config_host",
	    user: "sp_config_username",
	    password: "sp_config_password",
	    database: "sp_config_database",
	    charset : "utf8mb4",
	    debug: false,
	    waitForConnections: true,
	    multipleStatements: true
	},
	cors: {
		origin: '*',
 		optionsSuccessStatus: 200
	}
}

module.exports = config; 