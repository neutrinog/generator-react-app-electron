"use strict";
const Generator = require("yeoman-generator");
const askName = require("inquirer-npm-name");
const path = require("path");
const mkdirp = require("mkdirp");
const fs = require("fs-extra");
const _ = require("lodash");

function makeProjectName(name) {
  return _.kebabCase(name);
}

module.exports = class extends Generator {
  initializing() {
    this.props = {};
  }

  prompting() {
    return askName(
      {
        name: "name",
        message: "Your project name",
        default: makeProjectName(path.basename(process.cwd())),
        filter: makeProjectName,
        validate: str => {
          return str.length > 0;
        }
      },
      this
    ).then(props => {
      this.props.name = props.name;
      this.props.humanName = props.name
        .replace(/-/g, " ")
        .replace(/(\b.)/g, m => `${m[0].toUpperCase()}`);
    });
  }

  default() {
    if (path.basename(this.destinationPath()) !== this.props.name) {
      this.log(
        `Your project folder does not exist.\nI'll automatically create this folder.`
      );
      mkdirp(this.props.name);
      this.destinationRoot(this.destinationPath(this.props.name));
    }
  }

  writing() {
    const templatedFiles = [
      "README.md",
      "package.json",
      "public/index.html",
      "public/manifest.json"
    ];
    const templatedPaths = templatedFiles.map(file => this.templatePath(file));

    // Copy over everything
    fs.copySync(this.templatePath(""), this.destinationPath(""), {
      filter: file => templatedPaths.indexOf(file) === -1
    });

    // Inject project name
    for (const p of templatedFiles) {
      this.fs.copyTpl(this.templatePath(p), this.destinationPath(p), {
        projectHumanName: this.props.humanName,
        projectName: this.props.name
      });
    }
  }

  install() {
    this.installDependencies({
      bower: false,
      npm: false,
      yarn: true
    });
  }
};