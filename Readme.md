# Abstract

There has been some interest in exploring the use of inline styling libraries such as [Radium](https://github.com/FormidableLabs/radium). The purpose of this experiment is to see if there are any performance effects caused by applying styles inline versus applying them via a css file.

In this experiment we are looking at two possible advantages of inline styling:

1. Smaller total download size (the additional size of HTMl is offset by the removal of the css file)
2. Faster total download+render time due to the removal of an additional roundtrip, and time required to parse and resolve css selectors.

This experiment creates static HTML and CSS files, loads them using selenium webdriver, and measures the render time using [Performance Timing](https://developer.mozilla.org/en-US/docs/Web/API/Performance/timing).

# Install build and run

1. Download and change to directory.
2. Follow Selenium and Chrome install instructions [here](http://webdriver.io/guide/getstarted/install.html).
    * on OSX install selenium with: `brew install selenium-server-standalone`
3. run tests:
```bash
  ITERATIONS=1000 ./run-tests.sh
```

# Size of Test pages

The number of styles, nodes, and selectors used in this experiment were determined by sampling pages on existing sites. The javascript below was used.

```javascript
  console.log('Element Count:', document.querySelectorAll('*').length)

  rules = _.flatMap(document.styleSheets, (s) => {
    return s.cssRules && Array.prototype.slice.call(s.cssRules, 0);
  });

  console.log('Css Rule Count:', rules.length);
  console.log('Style Count:', _.sum(rules.map((r) => {return r && r.style && r.style.length})));
```

## Results

| URL	| Element Count	| Css Rule Count | Style Count | Rule / Element	| Style / Css Rule |
|-----|---------------|----------------|-------------|----------------|------------------|
| http://www.teenvogue.com/	| 949	| 1014	| 3779 | 1.068 |	3.726 |
| http://www.teenvogue.com/story/rowan-blanchard-wrinkle-in-time-premiere-date-mannequin-challenge	| 816	| 1228	| 4996 | 1.504 |	4.068 |
| http://www.teenvogue.com/story/vine-stars-jay-versace-brittany-furlan-jake-paul-thomas-sanders-jordan-doww-interview	| 1044	| 1228	| 4996 | 1.176 |	4.068 |
| http://www.golfdigest.com/	| 948	| 762	| 2809 | 0.803 |	3.686 |
| http://www.golfdigest.com/gallery/the-week-in-golf-instagrams-1114	| 797	| 886	| 3192 | 1.111 |	3.602 |
| http://www.golfdigest.com/story/a-highly-unofficial-ranking-of-who-has-the-most-juice-at-your-golf-club	| 962	| 968	| 3573 | 1.006 |	3.691 |
| http://www.allure.com/	| 769	| 710	| 3235 | 0.923 |	4.556 |
| http://www.allure.com/story/free-mac-lipstick-recycling-program	| 762	| 839	| 3611 | 1.101 |	4.303 |
| http://www.allure.com/gallery/fall-fashion-bags-guide-every-price-point	| 1492	| 871	| 3705 | 0.583 |	4.253 |
| **Median**	| **948**	| **886**	| **3611** | **1.068** | **4.068** |

## Test Parameters

After looking at the samples above; the following parameters were chosen for each experimental trial.

1. 1000 nodes (rounded up from the median nodes).
2. 1 rule / element.
2. 4 styles / rule

# Throttling

In order to investigate the effects of non trivial download times. A set of trials are run using a speed throttling server. The speed chosen was `2^19kbps` or `~= 525kbps`. This is close to the "Regular 3g (750kbps)" setting in the Chrome Dev tools.

# What is measured?

## Generated pages

The pages loaded and measured are generated anew for each iteration.

## File Size

The combined file-size of the style and markup. In the case of inline styling there is no separate style file and the size is only the markup file.


## Render Time

The time to render is calculated from the start of the request to the end of load. This takes into consideration the time to load the files as well as the time to parse, apply, and layout given style.

```javascript
const t = performance.timing;
return t.loadEventEnd - t.requestStart;
```


# Raw Results

| Inline or Separate | Throttled? | Avg. Render Time (ms) | Average Total File Size (Bytes) |
|--------------------|------------|-----------------------|---------------------------------|
| Separate           | Yes        | 1223                  | 747315                          |
| Inline             | Yes        | 1364                  | 735074                          |
| Separate           | No         | 109                   | 744616                          |
| Inline             | No         | 43                    | 735349                          |


# Supposition

The results appear mixed. In the case of throttling, the separate files appears to load more quickly. This is ad odds with the larger file size total. It is true that the HTML file is smaller in the case of separated styles: this might allow the browser to start parsing the HTML document and populating the DOM sooner, then later applying the styles once the css file is downloaded.

Curiously the relationship is reversed without throttling the connection and loading directly off the filesystem. Perhaps this is because the overhead of a larger HTML file is obviated and the additional roundtrip of the css file begins to dominate the render time.


# Possible Improvements / Further Study

## More representative layout
Right now the layout comprises a set of divs with random heights widths and background colors. This was quick to put together, but is hardly a good facsimile for a webpage.

## Better Style count estimation
The (Style / Css Rule) metric might be improved upon by detecting how many styles actually get applied to each node. This would have to be done by visiting each node and seeing how many css rules apply to it. This could be much more than the roughly four that were estimated.

The below script can be used to get the average style attributes attributed and applied to a node.

```javascript
const nodes = Array.prototype.slice.call(document.querySelectorAll('*'), 0);

const styleCounts = nodes.map((n) => {
  const rules = Array.prototype.slice.call(getMatchedCSSRules(n), 0);

  const styleSet = rules.map((r) => {
    const s = r.style;
    return _.pick(s, Array.prototype.slice.call(s, 0, s.length))
  });

  const styles = _.merge({}, ...styleSet);
  return {
    appliedCount: Object.keys(styles).length,
    totalCount: _.sum(_.map(styles, (s)=>{
      return Object.keys(s).length;
    }))
  }
});

const appliedCountAverage = _.sum(_.map(styleCounts, 'appliedCount')) / styleCounts.length;
const attributedCountAverage = _.sum(_.map(styleCounts, 'totalCount')) / styleCounts.length;
console.log('Average Styles applied', appliedCountAverage);
console.log('Average Styles attributed', attributedCountAverage);
console.log('Style Usage Average (Max 1)', 1 - (attributedCountAverage - appliedCountAverage) / attributedCountAverage);
```

## How do these react to compression?
With inline styling, there will be a lot of repeated text (this is part of the advantage of css). Would this repeated text mean better compression when compared to the css files?

## What about media queries and stateful styles?
How is rendering responsiveness affected by using something like [Radium](https://github.com/FormidableLabs/radium) to handle media queries and the style state (eg: `:hover`, `:active`)
