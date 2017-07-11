import Chart from './Chart';

export default class Amplitude extends Chart {
    constructor(settings) {
        super(settings);
        this.period = 1000 * 60 * 60 * 24 * 366;
        this.dateErrorMessage = 'You can select dates only for one year';

    }
    build() {
        this.getData(this.requestURL(this.settings.request));
    }

    convertData() {
        let modifiedData = new Map;

        this
            .data
            .map((item, i) => {
                let month = new Date(item.Date).getMonth();
                let year = new Date(item.Date).getFullYear();

                if (!modifiedData.get(year + '/' + month)) {

                    modifiedData.set(year + '/' + month, {
                        items: [],
                        year: year,
                        month: month
                    });
                }
                modifiedData
                    .get(year + '/' + month)
                    .items
                    .push(item);

            })

        let result = [];

        for (let item of modifiedData.values()) {

            let maxmin = this.getMaxMinElements(item.items, 'Cur_OfficialRate');

            let max = maxmin[1];
            let min = maxmin[0];

            result.push({
                month: item.month + 1,
                year: item.year,
                ampl: max - min,
                max: max,
                min: min
            })
        }

        let maxminAmpl = this.getMaxMinElements(result, 'ampl');

        this.domainScale([
            maxminAmpl[0] * 0.9,
            maxminAmpl[1]
        ], result);

        if (modifiedData.length != 0) {
            this.modifiedData = result;

            this.isDataLoaded = true;
            this.draw(result);
        } else {
            this.showAlert('Something wrong with server data.');
        }

    }
    buildAxis() {
        let scales = this.scales;
        let settings = this.settings.canvas;
        let maxmin = this.getMaxMinElements(this.modifiedData, 'ampl');
        this
            .canvas
            .append('g')
            .attr('style', 'transform: translateX(' + settings.axis + 'px)')
            .call(d3.axisLeft(scales.y));
    }

    draw(data) {
        let settings = this.settings.canvas;
        let scales = this.scales;
        let canvas = this.canvas;

        this.clearAlert();
        this.buildAxis();

        let barWidth = ((settings.width / data.length) - 1) < 1
            ? 1
            : (settings.width / data.length) - 1;
        canvas
            .selectAll('rect')
            .data(data)
            .enter()
            .append('rect')
            .attr('width', barWidth)
            .attr('fill', '#009aff')
            .attr('x', function (d, i) {
                return (barWidth + 1) * i + settings.axis;
            })
            .attr('y', function (d) {
                return scales.y(d.ampl);
            })
            .on('mousemove', function (d, ev) {
                let x = d3.mouse(this)[0]++;
                let y = d3.mouse(this)[1]++;
                let offsetX = x > settings.width / 2
                    ? x - 150
                    : x;
                let offsetY = y - 67;
                let infoPopup = canvas.select('#infoPopup');
                infoPopup
                    .select('.infoPopupDate text')
                    .text('Month: ' + d.month + '.' + d.year);
                infoPopup
                    .select('.infoPopupMaxMin text')
                    .text('Max/Min: ' + d.max + '/' + d.min);
                infoPopup
                    .select('.infoPopupAmpl text')
                    .text('Amplitude: ' + Math.round(d.ampl));

                infoPopup.attr(
                    'style',
                    'display: block; transform: translateX(' + offsetX + 'px) translateY(' +
                            offsetY + 'px)'
                );
            })
            .on('mouseleave', function () {
                canvas
                    .select('#infoPopup')
                    .attr('style', 'display: none;');
            })
            .transition()
            .duration(1000)
            .attr('height', function (d) {
                return settings.height - scales.y(d.ampl)
            })

        this.drawInfoBox();

    }

    drawInfoBox() {
        let group = this
            .canvas
            .append('g')
            .attr('id', 'infoPopup');

        group.append('rect');

        group
            .append('g')
            .attr('class', 'infoPopupDate')
            .append('text')
            .text('Date: 01.2016');

        group
            .append('g')
            .attr('class', 'infoPopupMaxMin')
            .append('text')
            .text('max/min: 100/90');

        group
            .append('g')
            .attr('class', 'infoPopupAmpl')
            .append('text')
            .text('Amplitude: 10');
    }
}
