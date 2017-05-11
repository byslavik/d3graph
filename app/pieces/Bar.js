import Chart from './Chart';

export default class Bar extends Chart {
  constructor(settings) {
    super(settings);
    this.period = 1000*60*60*24*31;

    this.betweenDates = this.checkDates(settings.request.startDate, settings.request.endDate, this.period, "You can select dates only for one month");

    if(this.betweenDates) {
      this.getData(this.requestURL(this.settings.request));
    }
  }
  convertData() {
    let modifiedData = [];
    this.domainScale(this.getMaxMinElements(this.data, 'Cur_OfficialRate'), this.data);

    let scales = this.scales;

    this.data.map((item, i)=> {
      let date = new Date(item.Date);
        modifiedData.push({
            y: scales.y(item.Cur_OfficialRate),
            x: scales.x(date)
        });
    })

    if(modifiedData.length != 0){
        this.modifiedData = modifiedData;

        this.isDataLoaded = true;
        this.draw(modifiedData);
    } else {
        this.showMessage('Something wrong. Please, verify your settings ant try again');
    }

  }
  buildAxis() {
    let scales = this.scales;
    let settings = this.settings.canvas;

    this.canvas.append('g').attr('style', 'transform: translateX(' + settings.axis + 'px)').call(d3.axisLeft(scales.y));
    this.canvas.append('g').attr('style', 'transform: translate(' + settings.axis + 'px, ' + settings.height  + 'px)').call(d3.axisBottom(scales.x));
  }

  draw(data) {
    let settings = this.settings.canvas;
    this.buildAxis();
    let barWidth = settings.width / data.length;
    this.canvas
            .selectAll('rect')
            .data(data)
            .enter()
            .append('rect')
            .attr('width', barWidth)
            .attr('fill', '#f90')
            .attr('x', function(d,i){return (barWidth + 5)*i + settings.axis;})
            .attr('y', function(d){ return settings.height - d.y;} )
            .transition()
            .duration(1000)
            .attr('height', function(d){return d.y})
  }
}
