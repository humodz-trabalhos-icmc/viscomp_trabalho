/* globals processCsv, plotMap, plotCorrelationMatrix */
'use strict';

// https://www.kaggle.com/zed9941/top-500-indian-cities
// https://github.com/deldersveld/topojson


d3.csv('data/india_cities.csv', (data) => {
    data = processCsv(data);

    plotMap(data);
    plotCorrelationMatrix(data);

    $('a.nav-link').click(function() {
        let target = $(this).attr('data-target');

        $(target).closest('.tab-content').children().hide();
        $(target).show();

    });
});
