# Size of Test pages

The number of styles, nodes, and selectors used in this experiment were determined by sampling pages on existing aviator sites.

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

| URL	| Element | Count	| Css Rule Count | Style Count | Rule / Element	| Style / Css Rule |
|-----|---------|-------|----------------|-------------|----------------|------------------|
| http://www.teenvogue.com/	| 949	| 1014	| 3779 | 1.068493151 |	3.726824458 |
| http://www.teenvogue.com/story/rowan-blanchard-wrinkle-in-time-premiere-date-mannequin-challenge	| 816	| 1228	| 4996 | 1.504901961 |	4.068403909 |
| http://www.teenvogue.com/story/vine-stars-jay-versace-brittany-furlan-jake-paul-thomas-sanders-jordan-doww-interview	| 1044	| 1228	| 4996 | 1.176245211 |	4.068403909 |
| http://www.golfdigest.com/	| 948	| 762	| 2809 | 0.803797468 |	3.686351706 |
| http://www.golfdigest.com/gallery/the-week-in-golf-instagrams-1114	| 797	| 886	| 3192 | 1.111668758 |	3.602708804 |
| http://www.golfdigest.com/story/a-highly-unofficial-ranking-of-who-has-the-most-juice-at-your-golf-club	| 962	| 968	| 3573 | 1.006237006 |	3.691115702 |
| http://www.allure.com/	| 769	| 710	| 3235 | 0.923276983 |	4.556338028 |
| http://www.allure.com/story/free-mac-lipstick-recycling-program	| 762	| 839	| 3611 | 1.101049869 |	4.303933254 |
| http://www.allure.com/gallery/fall-fashion-bags-guide-every-price-point	| 1492	| 871	| 3705 | 0.583780161 |	4.253731343 |
| Median	| 948	| 886	| 3611 | 1.068493151 |	4.068403909 |
