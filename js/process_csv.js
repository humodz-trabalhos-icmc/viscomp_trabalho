'use strict';


// Name of columns that should not be normalized
const NON_NUMERIC_COLUMNS = [
    'name_of_city',
    'state_code',
    'state_name',
    'dist_code',
    'location',
];


function processCsv(data) {
    let attrsToRename = [
        'total_graduates',
        'male_graduates',
        'female_graduates'
    ];

    let newAttrNames = attrsToRename.map((attr) => {
        let split = attr.split('_');
        return split[1] + '_' + split[0];
    });

    data.forEach((row) => {
        delete row['sex_ratio'];
        delete row['child_sex_ratio'];


        // Add 2 extra numeric columns: latitude and longitude
        let [lat, lng] = convertLocationToLatLng(row);
        row['latitude'] = lat;
        row['longitude'] = lng;

        // String -> Number conversion
        convertNumericColumns(row);

        // This attribute has a trailing space
        row['name_of_city'] = row['name_of_city'].trim();

        attrsToRename.forEach((oldName, i) => {
            let newName = newAttrNames[i];
            row[newName] = row[oldName];
            delete row[oldName];
        });
    });


    let columnNames = _.keys(data[0]);

    // Only these columns will be used for computations.
    let numericColNames = _.difference(columnNames, NON_NUMERIC_COLUMNS);

    let [stats, corrFields, corr] = calcCorrelationMatrix(data);

    return {
        numericColumns: numericColNames,
        nonNumericColumns: NON_NUMERIC_COLUMNS,
        table: data,
        stats,
        corr,
        corrFields,
    };
}


function convertLocationToLatLng(row) {
    let [lat, lng] = row['location']
        .split(',')
        .filter((str) => str !== '')
        .map((str) => Number(str));

    return [lat, lng];
}


function convertNumericColumns(row) {
    d3.keys(row).forEach((key) => {
        if(NON_NUMERIC_COLUMNS.indexOf(key) !== -1) {
            return;
        }

        row[key] = Number(row[key]);
    });
}


function calcCorrelationMatrix(data) {
    let newData = {};
    let corrAttributes = [];

    let divByPopTotal = [
        '0-6_population',
        'literates',
        'graduates',
    ];

    let calcGenderRatio = [
        'population',
        '0-6_population',
        'literates',
        'graduates',
    ];


    divByPopTotal.forEach((attr) => {
        corrAttributes.push(attr + '_ratio');
        newData[attr + '_ratio'] = data.map((row) => {
            return row[attr + '_total'] / row['population_total'];
        });
    });

    calcGenderRatio.forEach((attr) => {
        corrAttributes.push(attr + '_gender_ratio');
        newData[attr + '_gender_ratio'] = data.map((row) => {
            return row[attr + '_male'] / row[attr + '_female'];
        });
    });


    let stats = _.mapValues(newData, (numbers) => {
        let mean = math.mean(numbers);
        let std = math.std(numbers);

        let min = math.min(numbers);
        let max = math.max(numbers);

        return {mean, std, min, max};
    });

    console.log(stats, corrAttributes, newData);

    // https://www.johndcook.com/blog/2008/11/05/
    let correlationMatrix = _.map(newData, (x, colX) => {
        return _.map(newData, (y, colY) => {
            let xMean = stats[colX].mean;
            let yMean = stats[colY].mean;

            let xStd = stats[colX].std;
            let yStd = stats[colY].std;


            let r = 0;

            let n = x.length;
            for(let i = 0; i < n; i++) {
                r += ((x[i] - xMean) / xStd) * ((y[i] - yMean) / yStd);
            }

            r /= (n - 1);
            return r;
        });
    });

    return [stats, corrAttributes, correlationMatrix];
}
