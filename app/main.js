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
let app = null;

function changeView(ev) {
    switch (ev.target.value) {
        case 'Bar':
            app = new Bar(SETTINGS);
            app.build();
            break;
        case 'Amplitude':
            app = new Amplitude(SETTINGS);
            app.build();
            break;
        case 'Diagram':
            app = new Diagram(SETTINGS);
            app.build();
            break;
    }
}

typeSelector.addEventListener('change', changeView)