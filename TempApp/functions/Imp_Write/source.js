exports = function(data){
  //Get the current time
  var now = new Date();

  //Define Services and point to the correct Atlas collection
  var darksky = context.services.get("darksky");
  var mongodb = context.services.get("mongodb-atlas");
  var TempData = mongodb.db("Data").collection("Climate");
  var twilio = context.services.get("twilio");

  //Get data from DarkSky
  var response = darksky.get({"url": "https://api.darksky.net/forecast/" + context.values.get("DarkSkyKey") + '/' + context.values.get("DeviceLocation")});
  var darkskyJSON = EJSON.parse(response.body.text());

  var status =
    {
      "Timestamp": now.getTime(),
      "Date": now,
      "indoorTemp": data.temp*9/5+32,
      "indoorHumidity": data.humid,
      "outdoorTemp": darkskyJSON.currently.temperature,
      "outdoorHumidity": darkskyJSON.currently.humidity
    };
    
    //Check Temperature Status for Twilio Message 
    if(status.indoorTemp > 83){
      twilio.send({
        "to":  context.values.get('AdminPhone'),   // recipient phone #
        "from": context.values.get('TwilioPhone'), // sender phone #
        "body": 'Temperature has reached a critical level!'  // message
      });
    }

  return TempData.insertOne(status);
};