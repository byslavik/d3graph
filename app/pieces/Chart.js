export default class Chart {
  constructor(settings) {

    let that = this;
    this.settings = settings;
    this.isDataLoaded = false;

    this.alertBlock = document.getElementById('alertBlock');
    this.currIdBlcok = document.getElementById("currId");
    this.startDateBlock = document.getElementById("dateStart");
    this.endDateBlock = document.getElementById("dateEnd");

    this.buildCanvas(settings.canvas);

    this.currIdBlcok.addEventListener('change', this.setCurrId.bind(this));
    this.startDateBlock.addEventListener('change', this.setStartDate.bind(this));
    this.endDateBlock.addEventListener('change', this.setEndDate.bind(this));
  }
  rebuild(){
      let settings = this.settings;
      console.log('rebuild');
      this.clearCanvas();
      this.getData(this.requestURL(settings.request));

  }
  domainScale(maxmin, data){
      let dataLength = data.length;

      let settings = this.settings.canvas;
      let settingsRequest = this.settings.request;

      let mindate = new Date(settingsRequest.startDate),
          maxdate = new Date(settingsRequest.endDate);

      let scales = {
              y: d3.scaleLinear().domain([maxmin[0], maxmin[1]]).range([settings.height, 0]),
              x: d3.scaleTime().domain([mindate, maxdate]).range([0, settings.width]),
              oX: d3.scaleLinear().domain([0, settings.width]).range([0, dataLength])
          }



          this.scales = scales;
  }
  setCurrId(element) {
      this.settings.request.currId = element.target.value;
      this.rebuild();
  }
  setStartDate(element){
      this.settings.request.startDate = element.target.value;
      this.rebuild();
  }
  setEndDate(element){
      this.settings.request.endDate = element.target.value;
      this.rebuild();
  }
  getMaxMinElements(data, field) {
      let maxElement = 0;

      for(let item of data) {
          if(item[field] > maxElement) {
              maxElement = item[field]
          }
      }

      let minElement = maxElement;

      for(let item of data) {
          if(item[field] < minElement) {
              minElement = item[field]
          }
      }

      return [minElement, maxElement];
  }
  requestURL(settings){
      return 'http://www.nbrb.by/API/ExRates/Rates/Dynamics/' + settings.currId + '?startDate=' + settings.startDate + '&endDate=' + settings.endDate
  }
  getData(url){
      let promise = new Promise((resolve, reject) => {
          console.log('loading data...');
          fetch(url)
              .then((response)=>{
                  return response.json()
              })
              .then((data)=>{
                  resolve(data);
              })
              .catch((err)=>{
                  reject(err)
              });
      });

      promise
          .then(
              result => {
                  console.log('data loaded');
                  this.data = result;
                  this.isDataLoaded = true;
                  this.convertData();
              },
              error => {
                  console.log(error);
              }
          );
  }

  showMessage(text) {
      this.alertBlock.innerHTML = text;
  }

  clearMessage(){
      this.alertBlock.innerHTML = '';
  }

  checkDates(dateFrom, dateTo, dimension, message) { //to do : dimension
      dateFrom = Date.parse(dateFrom);
      dateTo = Date.parse(dateTo);

      let between = dateTo - dateFrom;
      if(between > dimension || between < 0){
        this.showMessage(message);
        return false;
      }

      return true;
  }

  clearCanvas() {
      console.log('cleaning...');
      this.canvas.selectAll('*').remove();
  }

  buildCanvas(settings){
      this.canvas = d3.select('body')
                      .append('svg')
                      .attr('width', settings.width + settings.axis + 150)
                      .attr('height', settings.height + settings.axis)
                      .attr('id', 'myCanvas');


  }

}
