// Global function called when select element is changed
const output = document.querySelector('output')

const doThings = (event) => {
	var select = d3.select('#categorySelect').node();
    // Get current value of select element
    var category = select.options[select.selectedIndex].value;

	const {value} = event.target
	output.value = `Max frequency value: ${value}`

    // update chart
    updateChart(category, value);
}

function onCategoryChanged() {
    var select = d3.select('#categorySelect').node();
    // Get current value of select element
    var month = select.options[select.selectedIndex].value;
    // Update chart with the selected category of letters
    updateChart(month);
}


// recall that when data is loaded into memory, numbers are loaded as strings
// this function helps convert numbers into string during data preprocessing
function dataPreprocessor(row) {
    return {
        date: row.date,
        year: row.date.split('-')[0],
        month: row.date.split('-')[1],
        day: row.date.split('-')[2],
        precipitation: +row.average_precipitation,
        actual: +row.actual_precipitation,
        low_temp: +row.average_min_temp,
        high_temp: +row.average_max_temp,
        mean_temp: +row.actual_mean_temp
    };
}

var svg = d3.select('svg');

// Get layout parameters
var svgWidth = +svg.attr('width');
var svgHeight = +svg.attr('height');

var padding = {t: 60, r: 40, b: 50, l: 40};

// Compute chart dimensions
var chartWidth = svgWidth - padding.l - padding.r;
var chartHeight = svgHeight - padding.t - padding.b;

// Compute the spacing for bar bands based on all date of the month
var barBand = chartHeight / 31;
var barHeight = barBand * 0.7;

// Create a group element for appending chart elements
var chartG = svg.append('g')
    .attr('transform', 'translate('+[padding.l, padding.t]+')');


d3.csv('KSEA.csv', dataPreprocessor).then(function(dataset) {
    // Create global variables here and intialize the chart
    data = dataset;


    // **** Your JavaScript code goes here ****
    var maxPrecipitation = d3.max(dataset, function(d) {
        return d.precipitation;
    })

    xScale = d3.scaleLinear().domain([0,maxPrecipitation]).range([0, 900])

    formatPercent = function(d) {
        return d * 100 + "%";
    }

    svg.append("line")          // attach a line
    .style("stroke", "black")  // colour the line
    .attr("x1", 30)     // x position of the first end of the line
    .attr("y1", 40)      // y position of the first end of the line
    .attr("x2", 30)     // x position of the second end of the line
    .attr("y2", 820);    // y position of the second end of the line

    svg.append("text").text("Weather Condition in Seattle")
    .attr("transform", "translate(" + ((chartWidth) - 550) + "," + 35 + ")")
    .attr("font-size", "20px")

    svg.append("text").text("Precipitation")
    .attr("transform", "translate(" + ((chartWidth) - 460) + "," + 865 + ")")
    .attr("font-size", "16px")

    axisTop = d3.axisTop(xScale);
    svg
    .append("g")
    .call(axisTop)
    .attr("class", "x axis")
    .attr("transform", "translate(" + 68 + "," + 840 + ")")
    
    var xscale = d3.scaleLinear()
    .domain([0, 1])
    .range([0, 900]);
    

    // Update the chart for all letters to initialize
    updateChart('7', 1);

});


function updateChart(filterKey, max=0.24) {

    // Create a filtered array of letters based on the filterKey
    var filteredMonth = data.filter(function(d){
        return d.month == filterKey && d.precipitation <= max;      
    });

    console.log(filteredMonth)

    // **** Draw and Update your chart here ****

    // create bars
    var bars = chartG.selectAll(".bar").data(filteredMonth, function(d) {
        return  d.date; //Use key function to maintain object constancy
    })

    //create the enter selection
    //here we will append our groups
    var barsEnter = bars.enter()
        .append("g")
        .attr("class", "bar")
    
    // //Create an UPDATE + ENTER selection
    // //Select all data-bound elements that are on SVG or just added to SVG
    bars.merge(barsEnter)
    .attr("transform", function(d, i) {
        return "translate("+[-10 + padding.l, i * 25 - 12]+")";
    })

    var div = d3.select("body").append("div")	
    .attr("class", "tooltip")				
    .style("opacity", 0);

    // //Add rectangles to the ENTER selection
    // //This will add a rect to each new group element
    barsEnter.append("rect")
    .attr("width", function(d) {
        return xScale(d.precipitation);
    })
    .attr("height", 15)
    .style("fill", d3.color("PowderBlue"))
    .on("mouseover", function(d) {		
        div.transition()		
            .duration(200)		
            .style("opacity", .9);		
        div	.html("Actual Precipitation:" + d.actual + "<br/>"  + "Actual Mean Temperature:" + d.mean_temp)	
            .style("left", (d3.event.pageX) + "px")		
            .style("top", (d3.event.pageY - 28) + "px");	
        })					
    .on("mouseout", function(d) {		
        div.transition()		
            .duration(500)		
            .style("opacity", 0);	
    });
    

    barsEnter.append("text")
    .text(function(d) {
        return d.low_temp + "°";
    })
    .attr("transform", "translate("+[-30, 12]+")")
    .attr("font-size", "12px")

    barsEnter.append("text")
    .text(function(d) {
        return d.day;
    }) 
    .attr("transform", "translate("+[-60, 12]+")")
    .attr("font-size", "12px")

    barsEnter.append("text")
    .text(function(d) {
        return d.high_temp + "°";
    }) 
    .attr("transform", "translate("+[900, 12]+")")
    .attr("font-size", "12px")

    // //exit and remove
    bars.exit().remove();
}

// Remember code outside of the data callback function will run before the data loads