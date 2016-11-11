import _ from 'lodash';
import fs from 'fs';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import faker from 'faker';
const webdriverio = require('webdriverio');

const ITERATIONS = 1;
const MAX_NODE_COUNT = 1500;
let nodeCount = 0;
const MAX_DEPTH = 15;

class TreeNode extends React.Component {
  render(){
    if (nodeCount > MAX_NODE_COUNT || this.props.currDepth >= MAX_DEPTH) {
      return null;
    }
    nodeCount++;

    let children = _.times(_.random(1, 5), () => {
      const child = <TreeNode
              className={faker.lorem.words(3).replace(/[^\w]/g, '-')}
              currDepth={this.props.currDepth + 1}
              classStack={_.concat(this.props.classStack, this.props.className)}/>;
      return child;
    });

    const style = {
      display: 'inline-block',
      backgroundColor: faker.internet.color(),
      height: _.random(200, 1000),
      width: _.random(200, 1000)
    };

    return (
      <div style={style} className={this.props.className}>
        {children}
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


function loadHtml(iteration = 0) {
  if (iteration > ITERATIONS) {
    return;
  }

  nodeCount = 0;
  const html = ReactDOMServer.renderToString(
    <TreeNode currDepth={0} classStack={[]} className={faker.lorem.word()} />
  );

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
