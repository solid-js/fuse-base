// Load bundle manager
import {SolidBundles} from 'solidify-lib/helpers/SolidBundles';

// Init HMR in dev mode
if (process.env.NODE_ENV !== 'production') require('./hmr');

// Get static compiled app bundles requires
// This file is only included into common app bundle
const bundlesRequireList = require('./bundles');

// Start bundles manager
SolidBundles.init(bundlesRequireList);
