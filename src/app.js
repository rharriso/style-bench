import _ from 'lodash';
import fs from 'fs';
import http from 'http';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import faker from 'faker';
const webdriverio = require('webdriverio');
import css from 'node-css';
import serveStatic from 'serve-static-throttle';
import finalhandler from 'finalhandler';

const MAX_NODE_COUNT = 1000;
const MAX_DEPTH = 10;
const AVAILABLE_CLASSES = faker.lorem.words(20).split(' ');
const ITERATIONS = parseInt(process.env.ITERATIONS, 10);
const INLINE_STYLE = process.env.INLINE_STYLE === 'true';
const THROTTLING = process.env.THROTTLE === 'true';
const TEST_URL = THROTTLING ? 'http://localhost:3000/test.html'
                            : `file:${process.cwd()}/test.html`;
const BROWSER = process.env.BROWSER || 'chrome';

let nodeCount = 0;
let style = '';


class TreeNode extends React.Component {
  static get style(){
    const style = {
      display: 'inline-block',
      height: _.random(200, 1000),
      width: _.random(200, 1000)
    };

    if (INLINE_STYLE) {
      style.backgroundColor = faker.internet.color();
    } else {
      style['background-color'] = faker.internet.color();
    }

    return style;
  }

  /**
   * render the treenode
   * @return {JSXElement} The element
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
      children =  _.times(_.random(1, 15), (i) => {
        nodeCount++;
        return (<TreeNode
                  key={i}
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

const options = { desiredCapabilities: { browserName: BROWSER }};
const client = webdriverio.remote(options).init();
const results = [];
const fileSizes = [];

if (THROTTLING) {
  const staticServe = serveStatic('./', {throttle: Math.pow(2, 19)}); // 100kBps
  // Create server
  var server = http.createServer(function onRequest(req, res) {
    staticServe(req, res, finalhandler(req, res));
  });
  // Listen
  server.listen(3000);
}

/**
 * load html and time the rendering
 *  @param {Number} iteration - what run is this?
 *  @returns {Promise} - promise of saving metrics
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
        ${INLINE_STYLE ? '' : '<link rel="stylesheet" href="style.css"/>'}
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

  return client.url(TEST_URL)
              .execute(function (){
                const t = performance.timing;
                return t.loadEventEnd - t.requestStart;
              }).then((result) => {
                results.push(result.value);
                const fileSize = stats.size + styleStats.size;
                fileSizes.push(fileSize);
                return loadHtml(iteration + 1);
              });
}

console.log('----------');
console.log('INLINE_STYLE', INLINE_STYLE);
console.log('ITERATIONS', ITERATIONS);
console.log('THROTTLE', THROTTLING);
console.log('BROWSER', BROWSER);

loadHtml(0).then(() => {
  client.end().then(() => {
    console.log('Average Run Time: ', Math.floor(_.sum(results) / results.length));
    console.log('Average Size:     ', Math.floor(_.sum(fileSizes) / fileSizes.length));
    console.log('----------');
    process.exit(0);
  });
});
