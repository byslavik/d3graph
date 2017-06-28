import Diagram from './pieces/Diagram';
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
        axis: 45
    }
};


let typeSelector = document.getElementById('type');

function changeView(ev) {
    switch (ev.target.value) {
        case 'bar':
            new Bar(SETTINGS);
            break;
        case 'ampl':
            new Amplitude(SETTINGS);
            break;
        case 'dia':
            new Diagram(SETTINGS);
            break;
    }
}

typeSelector.addEventListener('change', changeView)