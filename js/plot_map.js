/* globals createSvgCanvas, populateDropdowns */
'use strict';


function plotMap(data) {
    d3.json('data/india-map.json', (error, topology) => {
        if(error) {
            throw error;
        }

        let canvas = {
            width: 600,
            height: 600,
        };

        let svg = createSvgCanvas(
            'map-canvas', '#map-div',
            canvas.width, canvas.height);

        let projection = createMap(svg, canvas, topology);

        plotCirclesOnMap(svg, projection, data);
        populateDropdowns('.map-dropdown', data.numericColumns, () => {
            updateMapCircles(svg, data);
        });
    });
}


function createMap(svg, canvas, topology) {
    let zoomFactor = 10;
    let lngLatMapCenter = [81.674916, 21.378076];

    // http://bl.ocks.org/almccon/6ab03506d2e3ff9d843f69fa2d5c29cf
    let projection = d3.geoMercator()
        .scale(zoomFactor * canvas.width / (2 * Math.PI))
        .translate([canvas.width / 2, canvas.height / 2])
        .center(lngLatMapCenter);

    var path = d3.geoPath(projection);

    // Extract plotting data from the topology file
    let geojson = topojson.feature(topology, topology.objects.IND_adm1);

    // Draw map
    svg
        .append('g')
        .attr('class', 'map')
        .selectAll('path')
        .data(geojson.features)
        .enter()
        .append('path')
        .attr('d', path);

    return projection;
}


function plotCirclesOnMap(svg, projection, data) {
    svg
        .append('g')
        .attr('class', 'map')
        .selectAll('circle')
        .data(data.table)
        .enter()
        .append('circle')
        .attr('class', 'unset')
        .attr('cx', (d) => projection([d.longitude, 0])[0])
        .attr('cy', (d) => projection([0, d.latitude])[1]);
}


function updateMapCircles(svg, data) {
    let propA = $('#map-prop-a').html();
    let propB = $('#map-prop-b').html();

    let aValid = (data.numericColumns.indexOf(propA) !== -1);
    let bValid = (data.numericColumns.indexOf(propB) !== -1);

    let values = _.map(data.table, (row) => {
        let valA = aValid ? row[propA] : 1;
        let valB = bValid ? row[propB] : 1;

        if(valB === 0) {
            return 0;
        }

        return math.log(valA / valB);
    });


    let min = math.min(values);
    let max = math.max(values);


    let colorScale = d3.scaleLinear()
        .domain([min, max])
        .range([0, 1]);

    let radiusScale = d3.scaleLinear()
        .domain([min, max])
        .range([0.5, 3]);

    svg.selectAll('circle')
        .classed('unset', false)
        .data(values)
        .transition()
        .style('r', (d) => 2.5 * radiusScale(d) + 'px')
        .style('fill', (d) => d3.interpolateViridis(colorScale(d)))
        .style('opacity', 0.7);
}
