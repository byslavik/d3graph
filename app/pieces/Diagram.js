import Chart from './Chart';
export default class Diagram extends Chart {
    constructor(settings) {
        super(settings);
        let that = this;
        this.period = 1000 * 60 * 60 * 24 * 366;
        this
            .canvas
            .on('mousemove', function () {
                that.canvasHandler(d3.mouse(this))
            });
        this.bisector = d3
            .bisector(function (d) {
                return Date.parse(d.date);
            })
            .left;
    }
    build() {
        this.getData(this.requestURL(this.settings.request));
    }
    draw(data) {
        console.log('draw...');
        let group = this
            .canvas
            .append('g');
        let line = d3
            .line()
            .x((d) => {
                return d.x
            })
            .y((d) => {
                return d.y
            })
        var path = group
            .selectAll('path')
            .data([data])
            .enter()
            .append('path')
            .attr('class', 'line')
            .attr('d', line)
            .attr('fill', 'none')
            .attr('stroke', 'blue')
            .attr('stroke-width', 2)
            .attr('style', 'transform: translateX(' + this.settings.canvas.axis + 'px)')
        console.log('done');
        this.buildAxis();
    }
    buildAxis() {
        let scales = this.scales;
        let settings = this.settings.canvas;
        this
            .canvas
            .append('g')
            .attr('style', 'transform: translateX(' + settings.axis + 'px)')
            .call(d3.axisLeft(scales.y));
        this
            .canvas
            .append('g')
            .attr(
                'style',
                'transform: translate(' + settings.axis + 'px, ' + settings.height + 'px)'
            )
            .call(d3.axisBottom(scales.x));
    }
    formatDotDate(date) {
        var dd = date.getDate();
        if (dd < 10) 
            dd = '0' + dd;
        var mm = date.getMonth() + 1;
        if (mm < 10) 
            mm = '0' + mm;
        var yyyy = date.getFullYear()
        return dd + '.' + mm + '.' + yyyy;
    }
    convertData() {
        this.clearAlert();
        let sortField = this.isDenominated
            ? 'denominatedRate'
            : 'Cur_OfficialRate';
        this.domainScale(this.getMaxMinElements(this.data, sortField), this.data);
        let scales = this.scales;
        let settings = this.settings.canvas;
        let modifiedData = [];
        let linkedData = new Map;
        this
            .data
            .map((item, i) => {
                let date = new Date(item.Date);
                let dateFormated = this.formatDotDate(date);
                let itemRate = item.Cur_OfficialRate;
                let itemDen = item.denominatedRate;
                let rate = this.isDenominated
                    ? itemDen
                    : itemRate;
                let resultItem = {
                    y: scales.y(rate),
                    x: scales.x(date),
                    date: dateFormated,
                    origValue: this.isDenominated
                        ? rate.toFixed(3)
                        : rate
                };
                linkedData.set(dateFormated, resultItem);
                modifiedData.push(resultItem);
            })
        if (modifiedData.length != 0) {
            this.modifiedData = modifiedData;
            this.linkedData = linkedData;
            this.isDataLoaded = true;
            this.draw(modifiedData);
            this.addPointer();
            this.addInfoBlock();
        } else {
            this.showAlert('Something wrong with server data.');
        }
    }
    addPointer() {
        let settings = this.settings.canvas;
        this
            .canvas
            .append('rect')
            .attr('width', 1)
            .attr('x', -1)
            .attr('y', 0)
            .attr('height', settings.height)
            .attr('fill', '#000')
            .attr('id', 'areaPointer');
        this
            .canvas
            .append('circle')
            .attr('cx', -3)
            .attr('r', 3)
            .attr('cy', -3)
            .attr('fill', 'red')
            .attr('id', 'circlePointer')
    }
    addInfoBlock() {
        let canvasSettings = this.settings.canvas;
        let infoDateGroup = this
            .canvas
            .append('g');
        infoDateGroup
            .append('rect')
            .attr('id', 'infoDateContainer')
            .attr('width', 70)
            .attr('height', 23)
            .attr('stroke', '#f0c328')
            .attr('stroke-width', 1)
            .attr('fill', '#fff')
            .attr('x', -300)
            .attr('y', canvasSettings.height + 2);
        infoDateGroup
            .append('text')
            .attr('id', 'infoDate')
            .attr('x', -300)
            .attr('y', canvasSettings.height + 18);
        let infoCurrGroup = this
            .canvas
            .append('g');
        infoCurrGroup
            .append('rect')
            .attr('id', 'infoCurrencyContainer')
            .attr('width', 80)
            .attr('height', 23)
            .attr('stroke', '#f0c328')
            .attr('stroke-width', 1)
            .attr('fill', '#fff')
            .attr('x', canvasSettings.width + canvasSettings.axis)
            .attr('y', -canvasSettings.axis)
        infoCurrGroup
            .append('text')
            .attr('id', 'infoCurrency')
            .attr('x', canvasSettings.width + canvasSettings.axis + 5)
            .attr('y', -canvasSettings.axis)
    }
    canvasHandler(coords) {
        if (this.isDataLoaded) {
            let scales = this.scales;
            let canvas = this.canvas;
            let settings = this.settings.canvas;
            let x = coords[0];
            let x0 = scales
                .x
                .invert(x - settings.axis);
            let hoverItem = this
                .linkedData
                .get(this.formatDotDate(x0));
            if (hoverItem) {
                this
                    .canvas
                    .select('#areaPointer')
                    .transition()
                    .duration(70)
                    .attr('transform', 'translate(' + (
                        x
                    ) + ', 0)');
                this
                    .canvas
                    .select('#infoDateContainer')
                    .transition()
                    .duration(70)
                    .attr('x', x)
                this
                    .canvas
                    .select('#infoDate')
                    .transition()
                    .duration(70)
                    .attr('x', x + 5)
                    .text(this.formatDotDate(scales.x.invert(x)))
                this
                    .canvas
                    .select('#infoCurrencyContainer')
                    .transition()
                    .duration(70)
                    .attr('y', hoverItem.y);
                this
                    .canvas
                    .select('#infoCurrency')
                    .transition()
                    .duration(70)
                    .attr('y', hoverItem.y + 17)
                    .text(hoverItem.origValue + ' BRB')
                this
                    .canvas
                    .select('#circlePointer')
                    .transition()
                    .duration(70)
                    .attr('cx', x)
                    .attr('cy', hoverItem.y)
            }
        }
    }
}