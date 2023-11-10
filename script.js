const url = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json";

d3.json(url)
  .then((data) => {
    data.monthlyVariance.map((data) => {
      data.month -= 1;
    });
    const section = d3.select('body').append('section');
    const heading = section.append('heading');
      heading
        .append('h1')
        .attr('id', 'title')
        .text('Monthly Global Land-Surface Temperature');
      heading
        .append('h3')
        .attr('id', 'description')
        .text(data.monthlyVariance[0].year + ' - ' + data.monthlyVariance[data.monthlyVariance.length - 1].year + ': base temperature ' + data.baseTemperature + '°C');

    const width = Math.ceil(data.monthlyVariance.length/ 12) * 5;    // Number of years * scale
    const height = 12 * 50;    // Number of months * scale
    const padding = {
      top: 100,
      right: 200,
      bottom: 100,
      left: 200
    };

    const xScale = d3.scaleBand()
      .domain(data.monthlyVariance.map((d) => d.year))
      .range([0, width]);

    const yScale = d3.scaleBand()
      .domain([0,1,2,3,4,5,6,7,8,9,10,11])
      .range([0, height]);

    const xAxis = d3.axisBottom(xScale)
      .tickValues(xScale.domain().filter((year) => {
        return year % 10 === 0;
      }));
    
    const yAxis = d3.axisLeft(yScale)
      .tickValues(yScale.domain())
      .tickFormat(function (month) {
        var date = new Date(0);
        date.setUTCMonth(month);
        var format = d3.utcFormat('%B');
        return format(date);
      })
      .tickSize(10, 1);;
    
    const svg = section.append('svg')
      .attr('width', padding.left + width + padding.right)
      .attr('height', padding.top + height + padding.bottom);
    
      svg
        .append('g')
        .attr('class', 'x-axis')
        .attr('transform', 'translate(' + padding.left + ',' + (height + padding.top) + ')')
        .call(xAxis)
        .append('text')
        .text('Years')
        .attr('transform', 'translate(' + (width / 2) + ',' + (padding.bottom / 2) + ')')
        .attr('fill', 'currentColor')
        .style('text-anchor', 'middle');
      svg
        .append('g')
        .attr('class', 'y-axis')
        .attr('transform', 'translate(' + padding.left + ',' + padding.top + ')')
        .call(yAxis)
        .append('text')
        .text('Months')
        .attr('transform', 'translate(' + (- padding.left / 2) + ',' + (height/2) + ') rotate(-90)')
        .attr('fill', 'currentColor')
        .style('text-anchor', 'middle');

    const tooltip = d3
    .select('body')
    .append('div')
    .attr('class', 'tooltip')
    .attr('id', 'tooltip');

    // Create a sequential color scale with interpolateRdBu
    const maxExtent = Math.max(
      Math.abs(data.baseTemperature - d3.min(data.monthlyVariance, (d) => data.baseTemperature + d.variance)),
      Math.abs(d3.max(data.monthlyVariance, (d) => data.baseTemperature + d.variance) - data.baseTemperature)
    );
    const colorScale = d3.scaleSequential(d3.interpolateRdBu)
      .domain([data.baseTemperature + maxExtent, data.baseTemperature - maxExtent]);

      svg
        .append('g')
        .attr('class', 'map')
        .attr('transform', 'translate(' + padding.left + ',' + padding.top + ')')
        .selectAll('rect')
        .data(data.monthlyVariance)
        .enter()
        .append('rect')
        .attr('class', 'cell')
        .attr('data-month', (d) => d.month)
        .attr('data-year', (d) => d.year)
        .attr('data-temp', (d) => data.baseTemperature + d.variance)
        .attr('x', (d) => xScale(d.year))
        .attr('y', (d) => yScale(d.month))
        .attr('width', xScale.bandwidth())
        .attr('height', yScale.bandwidth())
        .attr('fill', (d) => colorScale(data.baseTemperature + d.variance))
        .on('mouseover', (event, d) => {
          const date = new Date(d.year, d.month);
          var content =
            "<span class='date'>" +
            d3.utcFormat('%Y - %B')(date) +
            '</span>' +
            '<br />' +
            "<span class='temperature'>" +
            d3.format('.1f')(data.baseTemperature + d.variance) +
            '&#8451;' +
            '</span>' +
            '<br />' +
            "<span class='variance'>" +
            d3.format('+.1f')(d.variance) +
            '&#8451;' +
            '</span>';
          
            const rectX = xScale(d.year) + padding.left;
            const rectY = yScale(d.month) + padding.top;

            tooltip
              .html(content)
              .style('opacity', 0.9)
              .style('left', rectX + 'px')
              .style('top', rectY + 'px');
          })
          .on('mouseout', (event, d) => {
            tooltip.style('opacity', 0);
        });

    // Create a legend with colors
    const legendWidth = 400;
    const legendHeight = 30;

    const legendScale = d3.scaleLinear()
    .domain([data.baseTemperature - maxExtent, data.baseTemperature + maxExtent])
    .range([0, legendWidth]);

    const legendColors = svg
      .append('g')
      .attr('class', 'legend')
      .attr('width', legendWidth)
      .attr('height', legendHeight)
      .attr('transform', 'translate(' + padding.left + ',' + (padding.top + height + padding.bottom / 2) + ')')
      .selectAll('rect')
      .data(d3.range(data.baseTemperature - maxExtent, data.baseTemperature + maxExtent, (2 * maxExtent) / 10))
      .enter()
      .append('rect')
      .attr('width', legendWidth / 10)
      .attr('height', legendHeight)
      .attr('x', (d) => legendScale(d))
      .attr('fill', (d) => colorScale(d));

    const legendText = svg
    .append('g')
    .attr('class', 'legend-text')
    .attr('width', legendWidth)
    .attr('height', legendHeight)
    .attr('transform', 'translate(' + padding.left + ',' + (padding.top + height + padding.bottom / 2 + legendHeight + 5) + ')')
    .selectAll('text')
    .data(d3.range(data.baseTemperature - maxExtent, data.baseTemperature + maxExtent, (2 * maxExtent) / 10))
    .enter()
    .append('text')
    .text((d) => d.toFixed(1))
    .attr('x', (d) => legendScale(d) + legendWidth / 20)
    .attr('y', 12)
    .attr('text-anchor', 'middle')
    .attr('fill', 'white');
    
  })
  .catch((err) => console.error(err));