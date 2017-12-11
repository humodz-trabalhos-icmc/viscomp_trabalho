/* globals createSvgCanvas */
'use strict';


function plotCorrelationMatrix(data) {
    let padding = {
        top: 0,
        bottom: 40,
        left: 40,
        right: 0
    };

    let canvas = {
        width: 600,
        height: 600,
    };

    let svg = createSvgCanvas(
        'corrmat-canvas', '#corrmat-div',
        canvas.width, canvas.height);

    let labels = data.corrFields;
    let covMat = data.corr;

    let realWidth = canvas.width - padding.right - padding.left;
    let rectSide = realWidth / labels.length;

    let xscale = d3.scaleBand()
        .domain(labels)
        .range([
            padding.left + rectSide/2,
            canvas.width - padding.right + rectSide/2
        ]);

    let yscale = d3.scaleBand()
        .domain(labels)
        .range([
            padding.top + rectSide/2,
            canvas.height - padding.bottom + rectSide/2
        ]);

    let labelPairs = [];

    labels.forEach((labelA) => {
        labels.forEach((labelB) => {
            labelPairs.push([labelA, labelB]);
        });
    });

    let labelToIndex = {};

    labels.forEach((elem, i) => {
        $('#corr-list').append('<li>' + elem + '</li>');
        labelToIndex[elem] = i;
    });


    function getCorrelation(labelPair) {
        let [lx, ly] = labelPair;
        let x = labelToIndex[lx];
        let y = labelToIndex[ly];
        return covMat[x][y];
    }


    svg.append('g')
        .attr('class', 'corrmat')
        .selectAll('rect')
        .data(labelPairs)
        .enter()
        .append('rect')
        .attr('fill', (d) => {
            let cov = getCorrelation(d);
            return d3.interpolateInferno((cov + 1) / 2);
        })
        .attr('width', rectSide)
        .attr('height', rectSide)
        .attr('x', (d) => xscale(d[0]) - rectSide/2)
        .attr('y', (d) => yscale(d[1]) - rectSide/2);

    svg.append('g')
        .attr('class', 'corrmat')
        .selectAll('text')
        .data(labelPairs)
        .enter()
        .append('text')
        .attr('fill', (d) => {
            let cov = getCorrelation(d);
            if(cov > 0) {
                return 'black';
            } else {
                return 'white';
            }
        })
        .attr('x', (d) => xscale(d[0]))
        .attr('y', (d) => yscale(d[1]))
        .text((d) => getCorrelation(d).toFixed(1));

    let xaxis_pos = canvas.height - padding.bottom;
    let yaxis_pos = padding.left;

    svg.append('g')
        .attr("transform", "translate(" + (-rectSide/2) + "," + xaxis_pos + ")")
        .call(d3.axisBottom(xscale))
        .selectAll('text')
        .style('font-size', '1.5rem')
        .style('shape-rendering', 'crispEdges')
        .text((d, i) => i+1);

    svg.append('g')
        .attr("transform", "translate(" + yaxis_pos + "," + (-rectSide/2) + ")")
        .call(d3.axisLeft(yscale))
        .style('font-size', '1.5rem')
        .style('shape-rendering', 'crispEdges')
        .selectAll('text')
        .text((d, i) => i+1);

}



