import isArray from 'lodash/lang/isArray';

export default function() {
  return function graphChart(d3, DOMNode, props) {
    const { data = [], id = 'd3svg', style = '', size = 1000, aspectRatio = 1.0, charge = -1, linkDistance = 1, maxNodeSize = 50 } = props;
    const margin = {
      top: size / 100,
      right: size / 50,
      bottom: size / 100,
      left: 40
    };
    const width = size - margin.left - margin.right;
    const height = size * aspectRatio - margin.top - margin.bottom;
    const fullWidth = size;
    const fullHeight = size * aspectRatio;

    const root = d3.select(DOMNode);
    const vis = root
      .append('svg')
      .attr({
        id,
        style,
        width: fullWidth,
        viewBox: `0 0 ${fullWidth} ${fullHeight}`,
        preserveAspectRatio: 'xMinYMin slice'
      })
      .append('g')
      .attr({
        transform: `translate(${margin.left}, ${margin.top})`
      });

    let node = vis.selectAll('circle');

    const force = d3.layout.force()
      .size([width, height])
      .nodes(data)
      .linkDistance(linkDistance)
      .charge(charge)
      .on('tick', function tick() {
        node.attr({
          cx: d => Math.round(d.x),
          cy: d => Math.round(d.y)
        });
      });

    let nodes = force.nodes();

    return function renderChart(nextNodes) {
      if (nextNodes) {
        nodes = [...nodes, ...nextNodes];
        force.nodes(nodes);
      }

      node = node.data(nodes);
      node.enter()
        .insert('circle')
        .attr({
          r: d => {
            const datum = d[d.key];
            if (!isArray(datum)) return 10;
            const radius = 10 + 2 * d[d.key].length;
            return radius > maxNodeSize ? maxNodeSize : radius;
          },
          fill: d => isArray(d[d.key]) ? 'blue' : 'red'
        })
        .on({
          mouseover: function nodeMouseover() {
            d3.select(this).style('fill-opacity', '0.5');
          },
          mouseout: function nodeMouseout() {
            d3.select(this).style('fill-opacity', '1');
          }
        })
        .call(force.drag);
      node.exit().remove();

      force.start();
    };
  };
}