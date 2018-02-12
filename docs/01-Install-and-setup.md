# Install a new project

##### MacOS or Linux :
- `curl https://raw.githubusercontent.com/solid-js/fuse-base/master/install.sh | sh`
- `node setup` and follow instructions.

##### Windows :
- [Download](https://github.com/solid-js/fuse-base/archive/master.zip) and unzip this repository.
- `npm i`
- `node setup` and follow instructions.


### Install errors

##### Npm install show error `"./util/has_lib.sh freetype" returned exit status 0`
- Do not mind, it will work :)

##### Any npm module issue ?
- Remove node_modules and force reinstall with `npm run please`



# Setup

##### Create your environment

Solidify can works with environment specific config.
Usually, the first thing to do is to create your environment properties file.

Copy the `deployer/default.properties.js` and add your own properties inside.
Replace `default` by your environment name.

Then you can activate this environment with `node fuse selectEnv`, a list will show in your CLI.
To select your environment directly (without interactive CLI), type `node fuse selectEnv %yourEnvName%` 

Deployment is executed before each compile so compiled files will always have select env properties.

##### Customize environment deployment

You can edit deployed files in `deployer/deployer.config.js` and add your own skeletons into `skeletons/deployer/`.