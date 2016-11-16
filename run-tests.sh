#!/bin/bash

gulp transpile;
INLINE_STYLE=false THROTTLE=true node lib/app.js
INLINE_STYLE=true  THROTTLE=true node lib/app.js
INLINE_STYLE=false THROTTLE=false node lib/app.js
INLINE_STYLE=true  THROTTLE=false node lib/app.js
