
// Load bundle manager
import {SolidBundles} from "solidify-lib/helpers/SolidBundles";

// Get static compiled app bundles requires
const bundlesRequireList = require('./bundles');

// Start bundles manager
SolidBundles.start( bundlesRequireList );