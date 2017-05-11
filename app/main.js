import Graph from './pieces/Graph';
import Bar from './pieces/Bar';
import Amplitude from './pieces/Amplitude';

const SETTINGS = {
    request: {
        currId: 190,
        startDate: '2015-5-1',
        endDate: '2016-5-1'
    },
    canvas: {
        width: 700,
        height: 500,
        gridQ: 40,
        axis: 30
    }
};


// let graphChart = new Graph(SETTINGS);
// let barChart = new Bar(SETTINGS);
let amplitudeChart = new Amplitude(SETTINGS);
//
