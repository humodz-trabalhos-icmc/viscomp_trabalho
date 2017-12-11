'use strict';


function populateDropdowns(myClass, options, dropdownCallback) {
    options.forEach((option) => {
        $(myClass).append(htmlDropdownItem(option));
    });

    $(myClass).find('a.dropdown-item').on('click', function() {
        let parent = $(this).closest('.dropdown');

        parent.find('.dropdown-selection').html($(this).html());
        dropdownCallback();
    });
}


function createSvgCanvas(id, where, width, height) {
    let svg = d3.select(where)
        .append('svg')
        .attr('preserveAspectRatio', 'xMinYMin meet')
        .attr('viewBox', '0 0 ' + width + ' ' + height)
        .attr('class', 'svg-content')
        .attr('id', 'india-map');

    return svg;
}


function htmlDropdownItem(content) {
    return '<a class="dropdown-item">' + content + '</a>';
}
