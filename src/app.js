import _ from 'lodash';
import fs from 'fs';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import phantom from 'phantom';
import faker from 'faker';

const MAX_NODE_COUNT = 1500;
let nodeCount = 0;
const MAX_DEPTH = 10;

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

const html = ReactDOMServer.renderToString(<TreeNode currDepth={0} />);

function loadHtml(html) {
  fs.writeFileSync('test.html', `<html><body>${html}</body></html>`);
  let phInstance;
  let sitePage;
  let startDate;

  return phantom.create()
    .then(instance => {
      phInstance = instance;
      return instance.createPage();
    })
    .then(page => {
      sitePage = page;
      return page.on('onLoadFinished', function (){
        console.log(Date.now() - startDate);
      });
    })
    .then(() => {
      startDate = Date.now();
      return sitePage.open('file://test.html');
    })
    .then(()=> {
      sitePage.close();
      phInstance.exit();
    })
    .catch(error => {
      console.log(error);
      phInstance.exit();
    });
}

//loadHtml(html);
_.times(100, () => loadHtml(html));
