#!/bin/sh

curl -L https://github.com/solid-js/fuse-base/archive/master.zip > fuse-base.zip

unzip fuse-base.zip
rm fuse-base.zip

mv fuse-base-master/* ./
rm -r fuse-base-master/

npm install

echo "Project installed !"
echo "Run 'node setup' to continue setup."