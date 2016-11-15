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
4. Regular 3g setting for (when throttling) throttling (750kbps ~= 2^19 525kbps)

# How times were measured?

Filesize, and Timing

# Results

After running for 1000 iterations here are the results for average render time.

CSS FILE:

CSS FILE (throttled):

Inline style

Inline style (throttled):
