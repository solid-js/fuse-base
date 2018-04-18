# Install a new project

You will need the latest [NodeJS](https://nodejs.org/en/) version installed on your environment.
We advice to use [NVM](https://github.com/creationix/nvm) if you are on Linux or MacOS.


##### MacOS or Linux :
- `curl https://raw.githubusercontent.com/solid-js/fuse-base/master/install.sh | sh`
- `node solid setup` and follow instructions.

##### Windows :
- [Download](https://github.com/solid-js/fuse-base/archive/master.zip) and unzip this repository.
- `npm i`
- `node solid setup` and follow instructions.


# Setup

##### Create your environment

Solidify can works with environment specific config.
Usually, the first thing to do is to create your environment properties file.

Copy the `properties/default.properties.js` and add your own properties inside.
Replace `default` by your environment name.

Then you can activate this environment with `node solid selectEnv`, a list will show in your CLI.
To select your environment directly (without interactive CLI), type `node solid selectEnv %yourEnvName%` 

Deployment is executed before each compile so compiled files will always have select env properties.

##### Customize environment deployment

You can edit deployed files in `solid-deploy.config.js` and add your own skeletons.