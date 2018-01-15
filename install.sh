#!/bin/sh

echo "Downloading solid-fuse-base archive..."
curl -L https://github.com/solid-js/fuse-base/archive/master.zip > fuse-base.zip
echo "Done !"
echo ""

echo "Installing archive..."
unzip -q fuse-base.zip
rm fuse-base.zip
mv fuse-base-master/* ./
mv fuse-base-master/.* ./
rm -r fuse-base-master/
echo "Done !"
echo ""

echo "Installing node dependencies..."
npm install
echo "Done !"
echo ""

echo "Project installed"
echo "Run 'node setup' to continue setup."