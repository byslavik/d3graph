import Chart from './Chart';

export default class Amplitude extends Chart {
  constructor(settings) {
    super(settings);
    this.period = 1000*60*60*24*366;

    this.betweenDates = this.checkDates(settings.request.startDate, settings.request.endDate, this.period, "You can select dates only for one month");

    if(this.betweenDates) {
      this.getData(this.requestURL(this.settings.request));
    }
  }
  convertData() {
    let modifiedData = [];


    this.data.map((item, i)=> {
      let month = new Date(item.Date).getMonth();
      let year = new Date(item.Date).getFullYear();

        if(!modifiedData[month]){
            modifiedData[month] = {};
            modifiedData[month].items = [];
            modifiedData[month].year = year;
        }
          modifiedData[month].items.push(item);

    })
    let result = modifiedData.map((item, i)=>{
      let maxmin = this.getMaxMinElements(item.items, 'Cur_OfficialRate');

      let max = maxmin[1];
      let min = maxmin[0];


      return {
        month: i + 1,
        year: item.year,
        ampl: max - min,
        max: max,
        min: min
      }
    });

    this.domainScale(this.getMaxMinElements(result, 'ampl'), result);

    console.log(result);

    if(modifiedData.length != 0){
        this.modifiedData = result;

        this.isDataLoaded = true;
        this.draw(result);
    } else {
        this.showMessage('Something wrong. Please, verify your settings ant try again');
    }

  }
  buildAxis() {
    let scales = this.scales;
    let settings = this.settings.canvas;
    let maxmin = this.getMaxMinElements(this.modifiedData, 'ampl');
    this.canvas.append('g').attr('style', 'transform: translateX(' + settings.axis + 'px)').call(d3.axisLeft(scales.y));
    // this.canvas.append('g').attr('style', 'transform: translate(' + settings.axis + 'px, ' + settings.height  + 'px)').call(d3.axisBottom(scales.x));
  }

  draw(data) {
    let settings = this.settings.canvas;
    this.buildAxis();
    let barWidth = settings.width / data.length - 5;
    // console.log(settings.width/length);
    this.canvas
            .selectAll('rect')
            .data(data)
            .enter()
            .append('rect')
            .attr('width', barWidth)
            .attr('fill', '#f90')
            .attr('x', function(d,i){return (barWidth + 5)*i + settings.axis;})
            .attr('y', function(d){ return settings.height - d.ampl;} )
            .transition()
            .duration(1000)
            .attr('height', function(d){console.log(d); return d.ampl})
  }
}
