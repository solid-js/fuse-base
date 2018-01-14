
// Load bundle manager
import {SolidBundles} from "solidify-lib/helpers/SolidBundles";

// Get static compiled app bundles requires
// This file is only included into common app bundle
const bundlesRequireList = require('./bundles');

// Start bundles manager
SolidBundles.init( bundlesRequireList );