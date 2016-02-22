var margin = {top: 20, right: 40, bottom: 40, left:40}; 
    
var width = 960,
    height = 500; 

var timeParse = d3.timeParse("%x");

// load model data
d3.json('model.json', function(error, data){
  
  //Parse JSON Model Object
  var energy = d3.entries(JSON.parse(data.values).energy)
       .map(d => ({date: timeParse(d.key), energy: d.value}));

  var params = d3.entries(data.params)
        .map(d => ({name: d.key, coef: d.value}));
  
  // Scales
  var y = d3.scaleLinear()
    .range([height, 0])
    .domain([0, d3.max(energy, d => d.energy)]);

  var x = d3.scaleTime()
    .range([0, width])
    .domain(d3.extent(energy, d => d.date));

  var xAxis = d3.axisBottom()
      .scale(x);

  var area = d3.area()
      .x(d => x(d.date))
      .y0(y(0))
      .y1(d => y(d.energy));
  //Draw Svg
  var svg = d3.select("body").selectAll("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);
   
  svg.append("path")
      .attr("fill", "steelblue")
      .attr("class", "area")
      .attr("d", area(energy));
      
  var voronoi = d3.voronoi()
    .x(d => d.date)
    .y(d => d.energy);

  svg.append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(xAxis);
      
  svg.append("g")
      .attr("class", "voronoi")
      .selectAll("path")
      .datum(voronoi(energy))
    .enter().append("path")
      .attr("d", d => `M ${d.join("L")} Z`);
    

  // Bar Chart
  var yBar = d3.scaleBand()
    .rangeRound([0, height/2])
    .padding(.1)
    .domain(params.map(d => d.name));

  var xBar = d3.scaleLinear()
    .range([0, width])
    .domain([0, d3.max(params, d => d.coef)])
    .nice();

  var xBarAxis = d3.axisBottom()
    .scale(xBar);

  var yBarAxis = d3.axisLeft()
    .scale(yBar);

  // Draw Bar
  var bar = d3.select("body").selectAll("div")
    .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height/2 + margin.top + margin.bottom)
    .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`)

   bar.selectAll(".bar")
      .data(params)
    .enter().append("rect")
      .attr("y", d => yBar(d.name))
      .attr("x", d => xBar(0))
      .attr("width", d => xBar(d.coef))
      .attr("height", yBar.bandwidth);

  //XAxis
   bar.append("g")
    .attr("class", "x axis")
    .attr("transform", `translate(0, ${height/2})`)
    .call(xBarAxis)

  //YAxis
  bar.append("g")
    .attr("class", "y axis")
    .call(yBarAxis)


  console.log(energy);
});