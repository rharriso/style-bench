import _ from 'lodash';
import fs from 'fs';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import faker from 'faker';
const webdriverio = require('webdriverio');
import css from 'node-css';

const ITERATIONS = 1;
const MAX_NODE_COUNT = 1500;
let nodeCount = 0;
const MAX_DEPTH = 10;

class TreeNode extends React.Component {
  static get style(){
    return {
      display: 'inline-block',
      backgroundColor: faker.internet.color(),
      height: _.random(200, 1000),
      width: _.random(200, 1000)
    };
  }

  constructor(props) {
    super(props);
    this.state = {};

    if (nodeCount > MAX_NODE_COUNT || this.props.currDepth >= MAX_DEPTH) {
      return;
    }

    this.state.children =  _.times(_.random(1, 15), () => {
      nodeCount++;
      return (<TreeNode
                className={faker.lorem.words(3).replace(/[^\w]/g, '-')}
                currDepth={this.props.currDepth + 1}
                classStack={_.concat(this.props.classStack, this.props.className)}/>);
    });
  }


  render(){
    return (
      <div style={TreeNode.style} className={this.props.className}>
        {this.state.children}
        {faker.lorem.sentences(_.random(0, 25))}
        {_.random(0, 10) === 9 && <img src={faker.image.cats()}/>}
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
function getCss(tree){
  console.log(tree.props.className);
  console.log('self', tree);
  const children = React.Children.toArray(tree.state.children);
  console.log('Children', children);
  const sample = _.sampleSize(tree.classStack, 4);
  const classes = _.sortBy(sample, _.partial(_.indexOf, tree.props.classStack));
  const selector = _.map(classes, (c)=> {
    return '.' + c;
  }).join(' ');

  const style = css(selector, TreeNode.style);
  return style;
}


/**
 *
 */
function loadHtml(iteration = 0) {
  if (iteration > ITERATIONS) {
    return;
  }

  nodeCount = 0;
  const tree = <TreeNode currDepth={0} classStack={[]} className={faker.lorem.word()} />;
  const html = ReactDOMServer.renderToString(tree);
  getCss(tree);

  fs.writeFileSync('test.html', `<html><body>${html}</body></html>`);
  const stats = fs.statSync('test.html');

  return client.url(`file://${process.cwd()}/test.html`)
              .execute(function (){
                const t = performance.timing;
                return t.loadEventEnd - t.responseEnd;
              }).then((result) => {
                results.push(result.value);
                fileSizes.push(stats.size);
                console.log('File Size | Render Time: ', stats.size, result.value);
                return loadHtml(iteration + 1);
              });
}

loadHtml(0).then(() => {
  //client.end();
  console.log('Average Run Time: ', Math.floor(_.sum(results) / results.length));
  console.log('Average Size:     ', Math.floor(_.sum(fileSizes) / fileSizes.length));
});
