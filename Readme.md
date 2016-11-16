# Size of Test pages

The number of styles, nodes, and selectors used in this experiment were determined by sampling pages on existing sites.

## getting node and style counts from pages

1. Visit pages
2. Run js

```javascript
console.log('Element Count:', document.querySelectorAll('*').length)
rules = _.flatMap(document.styleSheets, (s) => { return s.cssRules && Array.prototype.slice.call(s.cssRules, 0); });
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

Looking samples I've chosen the following parameters to run the tests.

1. 1000 nodes (rounded up from the median nodes).
2. 1 rule / element.
2. 4 styles / rule
4. Regular 3g setting for throttling (750kbps ~= 2^19 525kbps)

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

After running each trial for 1000 iterations here are the results for average render time.

| Inline or Separate | Throttled? | Avg. Render Time (ms) | Average Total File Size |
|--------------------|------------|-----------------------|-------------------------|
| Separate           | Yes        | 1223                  | 747315                  |
| Inline             | Yes        | 1364                  | 735074                  |
| Separate           | No         | 109                   | 744616                  |
| Inline             | No         | 43                    | 735349                  |


# Findings

# Possible Improvements / Further Study

## More representative layout
Right now the layout comprises a set of divs with random heights widths and background colors. This was quick to put together, but is hardly a good facsimile for a webpage.

## Better Style count estimation
The (Style / Css Rule) metric might be improved upon by detecting how many styles actually get applied to each node. This would have to be done by visiting each node and seeing how many css rules apply to it. This could be much more than the roughly four that were estimated.

## How do these react to compression?
With inline styling, there will be a lot of repeated text (this is part of the advantage of css). Would this repeated text mean better compression when compared to the css files?
