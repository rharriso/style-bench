import _ from 'lodash';
import fs from 'fs';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import faker from 'faker';
const webdriverio = require('webdriverio');

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
      const child = <TreeNode currDepth={this.props.currDepth + 1}/>;
      return child;
    });

    const style = {
      display: 'inline-block',
      backgroundColor: faker.internet.color(),
      height: _.random(200, 1000),
      width: _.random(200, 1000)
    };

    return <div style={style}>
      {children}
      {faker.lorem.sentences(_.random(0, 25))}
      {_.random(0, 10) === 9 && <img src={faker.image.cats()}/>}
    </div>;
  }
}

const options = { desiredCapabilities: { browserName: 'chrome' } };
const client = webdriverio.remote(options).init();
const results = [];


function loadHtml(iteration = 0) {
  if (iteration > 100) {
    return;
  }

  nodeCount = 0;
  const html = ReactDOMServer.renderToString(<TreeNode currDepth={0} />);
  fs.writeFileSync('test.html', `<html><body>${html}</body></html>`);

  return client.url(`file://${process.cwd()}/test.html`)
              .execute(function (){
                const t = performance.timing;
                return t.loadEventEnd - t.responseEnd;
              }).then((result) => {
                results.push(result.value);
                console.log('Render Time: ', result.value);
                return loadHtml(iteration + 1);
              });
}

loadHtml(0).then(() => {
  //client.end();
  console.log(results);
});
