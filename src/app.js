import _ from 'lodash';
import fs from 'fs';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import faker from 'faker';
const webdriverio = require('webdriverio');
import css from 'node-css';

const ITERATIONS = 100;
const MAX_NODE_COUNT = 1500;
let nodeCount = 0;
const MAX_DEPTH = 10;
const AVAILABLE_CLASSES = faker.lorem.words(20).split(' ');
const INLINE_STYLE = process.env.INLINE_STYLE === 'true';
let style = '';


class TreeNode extends React.Component {
  static get style(){
    return {
      display: 'inline-block',
      'background-color': faker.internet.color(),
      height: _.random(200, 1000),
      width: _.random(200, 1000)
    };
  }

  /**
   *
   */
  render(){
    const className = _.sample(AVAILABLE_CLASSES);
    const elStyle = TreeNode.style;
    const sample = _.sampleSize(this.props.classStack, 4);
    const classes = _.filter(sample.sort(_.partial(_.indexOf, this.props.classStack), _.isUndefined));
    const selector = _.map(classes, (c)=> {
      return '.' + c;
    }).join(' ');

    if (_.random(0, 3) > 0){
      style += css(selector, elStyle);
    }

    let children;

    if (nodeCount < MAX_NODE_COUNT && this.props.currDepth < MAX_DEPTH) {
      children =  _.times(_.random(1, 15), () => {
        nodeCount++;
        return (<TreeNode
                  className={_.sample(classes)}
                  currDepth={this.props.currDepth + 1}
                  classStack={_.concat(this.props.classStack, className)}/>);
      });
    }

    return (
      <div className={className} style={INLINE_STYLE ? elStyle : {}} >
        {children}
        {faker.lorem.sentences(_.random(0, 25))}
      </div>
    );
  }
}

const options = { desiredCapabilities: { browserName: 'chrome' } };
const client = webdriverio.remote(options).init();
const results = [];
const fileSizes = [];


/**
 *
 */
function loadHtml(iteration = 0) {
  if (iteration > ITERATIONS) {
    return;
  }

  nodeCount = 0;
  style = 0;
  const tree = <TreeNode currDepth={0} classStack={[]} />;
  const html = ReactDOMServer.renderToString(tree);

  fs.writeFileSync('test.html',
   `<html>
      <head>
        <link rel='stylesheet' href='style.css'/>
        <script type='text/javascript' src='https://rawgit.com/lodash/lodash/4.17.1/dist/lodash.js'></script>
      </head>
      <body>${html}</body>
    </html>`
  );
  const stats = fs.statSync('test.html');

  if (INLINE_STYLE) {
    fs.writeFileSync('style.css', '');
  } else {
    fs.writeFileSync('style.css', style);
  }

  const styleStats = fs.statSync('style.css');

  return client.url(`file://${process.cwd()}/test.html`)
              .execute(function (){
                const t = performance.timing;
                return t.loadEventEnd - t.responseEnd;
              }).then((result) => {
                results.push(result.value);
                const fileSize = stats.size + styleStats.size;
                fileSizes.push(fileSize);
                console.log(`ITERATION ${iteration} File Size: ${stats.size} | ${styleStats.size}, time ${result.value}`);
                return loadHtml(iteration + 1);
              });
}

loadHtml(0).then(() => {
  //client.end();
  console.log('Average Run Time: ', Math.floor(_.sum(results) / results.length));
  console.log('Average Size:     ', Math.floor(_.sum(fileSizes) / fileSizes.length));
});
