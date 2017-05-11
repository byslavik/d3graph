import Chart from './Chart';

export default class Graph extends Chart {
  constructor(settings) {
    super(settings);

    let that = this;
    this.period = 1000*60*60*24*366;

    this.betweenDates = this.checkDates(settings.request.startDate, settings.request.endDate, this.period, "You can select dates only for one year");

    if(this.betweenDates) {
      this.getData(this.requestURL(this.settings.request));

      this.canvas.on("mousemove", function() {that.canvasHandler(d3.mouse(this)) } );
    }
  }
  draw(data) {
      console.log('draw...');
      let line = d3.line()
                      .x((d) => {return d.x})
                      .y((d) => {return d.y})

      let group = this.canvas.append('g');
      let transition = this.transition;
      group.selectAll('path')
              .data([data])
              .enter()
              .append('path')
              .attr('d', line)
              .attr('fill', 'none')
              .attr('stroke', 'blue')
              .attr('stroke-width', 2 )
              .attr('style', "transform: translateX(30px)" )

      console.log('done');
      this.buildAxis();

  }

  buildAxis() {
    let scales = this.scales;
    let settings = this.settings.canvas;

    this.canvas.append('g').attr('style', 'transform: translateX(' + settings.axis + 'px)').call(d3.axisLeft(scales.y));
    this.canvas.append('g').attr('style', 'transform: translate(' + settings.axis + 'px, ' + settings.height  + 'px)').call(d3.axisBottom(scales.x));
  }

  formatDate(date) {
      var dd = date.getDate();
      if (dd < 10) dd = '0' + dd;

      var mm = date.getMonth() + 1;
      if (mm < 10) mm = '0' + mm;

      var yyyy = date.getFullYear()

      return dd + '.' + mm + '.' + yyyy;
  }
  convertData(){
      this.clearMessage();
      this.domainScale(this.getMaxMinElements(this.data, 'Cur_OfficialRate'), this.data);

      let scales = this.scales;

      let settings = this.settings.canvas;
      let modifiedData = [];

      this.data.map((item, i)=> {
        let date = new Date(item.Date)
          modifiedData.push({
              y: scales.y(item.Cur_OfficialRate),
              x: scales.x(date),
              date: this.formatDate(date),
              origValue: item.Cur_OfficialRate
          });
      })
      if(modifiedData.length != 0){
          this.modifiedData = modifiedData;
          console.log(modifiedData);
          this.isDataLoaded = true;
          this.draw(modifiedData);
          this.addPointer();
          this.addInfoBlock();
      } else {
          this.showMessage('Something wrong. Please, verify your settings ant try again');
      }

  }
  addPointer(){
      let settings = this.settings.canvas;
      this.canvas.append('rect')
                      .attr('width', 1)
                      .attr('x', -1)
                      .attr('y', 0)
                      .attr('height', settings.height)
                      .attr('fill', '#000')
                      .attr('id', 'areaPointer');
      this.canvas.append('circle')
                    .attr('cx', -3)
                    .attr('r', 3)
                    .attr('cy', -3)
                    .attr('fill', 'red')
                    .attr('id', 'circlePointer')
  }
  addInfoBlock(){
      let canvasSettings = this.settings.canvas;
      let infoDateGroup = this.canvas.append('g');
      infoDateGroup.append('rect')
                              .attr('id', 'infoDateContainer')
                              .attr('width', 70)
                              .attr('height', 23)
                              .attr('stroke', '#f0c328')
                              .attr('stroke-width', 1)
                              .attr('fill', '#fff')
                              .attr('x', -300)
                              .attr('y', canvasSettings.height+2);

      infoDateGroup.append('text')
                          .attr('id', 'infoDate')
                          .attr('x', -300)
                          .attr('y', canvasSettings.height+18);


      let infoCurrGroup = this.canvas.append('g');
      infoCurrGroup.append('rect')
                              .attr('id', 'infoCurrencyContainer')
                              .attr('width',80)
                              .attr('height', 23)
                              .attr('stroke', '#f0c328')
                              .attr('stroke-width', 1)
                              .attr('fill', '#fff')
                              .attr('x', canvasSettings.width + canvasSettings.axis)
                              .attr('y', -30)

      infoCurrGroup.append('text')
                          .attr('id', 'infoCurrency')
                          .attr('x', canvasSettings.width + canvasSettings.axis+5)
                          .attr('y', -30)

  }
  canvasHandler(coords){

    // console.log(coords);
      if(this.isDataLoaded){
          let scales = this.scales;
          let x = coords[0];
          let settings = this.settings.canvas;
          // console.log(x);
          let element = this.modifiedData[Math.round(scales.oX(x - settings.axis))];
          if(element){
              this.canvas
                  .select('#areaPointer')
                  .transition()
                  .duration(70)
                  .attr('transform', 'translate(' + x + ', 0)');

              this.canvas
                  .select('#infoDateContainer')
                  .transition()
                  .duration(70)
                  .attr('x', x)
              this.canvas
                  .select('#infoDate')
                  .transition()
                  .duration(70)
                  .attr('x', x+5)
                  .text(element.date.split('T')[0])

              this.canvas
                  .select('#infoCurrencyContainer')
                  .transition()
                  .duration(70)
                  .attr('y', element.y);

              this.canvas
                  .select('#infoCurrency')
                  .transition()
                  .duration(70)
                  .attr('y', element.y+17)
                  .text(element.origValue + " BRB")

              this.canvas
                      .select('#circlePointer')
                      .transition()
                      .duration(70)
                      .attr('cx', x)
                      .attr('cy', element.y)
          }
      }

  }
}
