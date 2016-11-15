#!/bin/bash

gulp transpile;
INLINE_STYLE=false ITERATIONS=5 THROTTLE=true node lib/app.js
INLINE_STYLE=true  ITERATIONS=5 THROTTLE=true node lib/app.js
INLINE_STYLE=false ITERATIONS=5 THROTTLE=false node lib/app.js
INLINE_STYLE=true  ITERATIONS=5 THROTTLE=false node lib/app.js
