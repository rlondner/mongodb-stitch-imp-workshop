const appId = "climatelab-jgqgu";
const dashboardApiKey = "GX6jAwp5HWPbN19OUcEfORzrFqQEyA3Vf34fqk4047vLlIGZtPkcm9BP7zyD6gt0";
let stitchClient, cluster;

// Define dimensions of graph using window size/time
let margins = [
  0.05 * window.innerHeight,
  0.05 * window.innerHeight,
  0.03 * window.innerWidth,
  0.06 * window.innerWidth
];
let width = 0.4 * window.innerWidth;
let height = 0.6 * window.innerHeight;
var duration = 120000;
var now = Date.now();

// X scale will fit all values within the set time interval to window size
// Y scale will fit values from 0-30 within window size
var xScale = d3
  .scaleTime()
  .domain([now - duration, now])
  .range([0, width]);
var yScale = d3
  .scaleLinear()
  .domain([50, 100])
  .range([height, 0]);

// Create a line function that can convert data into X/Y points
// Assign the X/Y functions to plot our Timestamp/Total
var line = d3
  .line()
  .x(d => xScale(d.timestamp))
  .y(d => yScale(d.temp))
  .curve(d3.curveBasis);

// Add an SVG element with the desired dimensions and margin.
var graph = d3
  .select("#graph1")
  .append("svg")
  .attr("width", width + 100)
  .attr("height", height + margins[0] + margins[2]);
const g = graph
  .append("g")
  .attr("transform", "translate(" + margins[3] + "," + margins[0] + ")");

// Add the x-axis
var xAxis = g
  .append("g")
  .attr("class", "axis axis-x")
  .attr("transform", "translate(0," + height + ")")
  .call((xScale.axis = d3.axisBottom().scale(xScale)));

// Add the y-axis
var yAxis = g
  .append("g")
  .attr("class", "axis axis-y")
  .attr("transform", "translate(-25,0)")
  .call((yScale.axis = d3.axisLeft().scale(yScale)));

// Log in to Stitch with anonymous authentication
function simpleAuth() {
  stitch.StitchClientFactory.create(appId).then(client => {
    stitchClient = client;

    stitchClient.login().then(build);
  });
}

// Authenticate with Stitch using an API Key
function apiKeyAuth() {
  stitch.StitchClientFactory.create(appId)
  .then(client => {
    stitchClient = client;

    stitchClient
      .authenticate(
        "apiKey",
        dashboardApiKey
      )
      .then(buildGraph);
  });
}

function buildGraph() {
  // Use Stitch to pull the latest data and then graph it
  var now = Date.now();
  stitchClient
    .executeFunction("RecentTemp", now - duration, now)
    .then(docs => {
      var TempLine = docs.map(doc => ({
        timestamp: doc["Timestamp"],
        temp: doc["indoorTemp"]
      }));

      // Plot the data and then call the refresh loop
      g.path = g
        .append("path")
        .datum(TempLine)
        .attr("stroke", "mediumturquoise")
        .attr("d", line);

      setTimeout(() => {
        refreshGraph(TempLine, g.path);
      }, 1000);
    });

}

function refreshGraph(TempLine, path) {
  // Find the updated time range
  var now = Date.now();
  var then = TempLine[TempLine.length - 1].timestamp;
  // Get any new sales data from Stitch
  stitchClient.executeFunction("RecentTemp", then, now)
  .then(docs => {
    var newPts = docs.map(doc => ({
      timestamp: doc.Timestamp,
      temp: doc.indoorTemp
    }));

    if (newPts.length > 0) {
      // Add new Sales points and remove old points
      for (var pt in newPts) {
        path.datum().push(newPts[pt]);
        path.attr("d", line);
      }

      while (path.datum()[0].timestamp < now - duration) {
        path.datum().shift();
      }

      // Slide x-axis left
      xScale.domain([now - duration, now]);
      xAxis
        .transition()
        .duration(1000)
        .call(xScale.axis);

      // Slide path
      path
        .transition()
        .duration(1000)
        .attr("d", line);
    }
    setTimeout(() => {
      refreshGraph(TempLine, g.path);
    }, 1000);
  });
}

//simpleAuth();
 apiKeyAuth();
