#require "MongoDBStitch.agent.lib.nut:1.0.0"

//Create the connection to Stitch
stitch <- MongoDBStitch("<APP ID>");

//Add an API key to link this device to a specific Stitch User
const API_KEY = "<APP API KEY>";

//Ensure you are authenticated to Stitch
stitch.loginWithApiKey(API_KEY);

function log(data) {
    stitch.executeFunction("Imp_Write", [data], function (error, response) {
        if (error) {
            server.log("error: " + error.details);
        } else {
            server.log("Climate Sent!");
        }
    });

    server.log("Temperature is " + data.temp);
}

// Register a function to receive sensor data from the device
device.on("reading.sent", log);
