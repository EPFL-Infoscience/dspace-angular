/*
 * Custom Type Definitions
 * When including 3rd party modules you also need to include the type definition for the module
 * if they don't provide one within the module. You can try to install it with typings
typings install node --save
 * If you can't find the type definition in the registry we can make an ambient definition in
 * this file for now. For example
declare module "my-module" {
  export function doesSomething(value: string): string;
}
 *
 * If you're prototying and you will fix the types later you can also declare it as type any
 *
declare var assert: any;
 *
 * If you're importing a module that uses Node.js modules which are CommonJS you need to import as
 *
import * as _ from 'lodash'
 * You can include your type definitions in this file until you create one for the typings registry
 * see https://github.com/typings/registry
 *
 */

// declare module '*'; // default type definitions for any for modules that are not found.
// caveat: if this is enabled and you do not have the proper module there may not be an error.
// suggestion: follow the pattern below with modern-lru which provides an alternative way to create an 'any' module.

// for legacy tslint etc to understand
declare module 'modern-lru' {
  const x: any;
  export = x;
}
declare module 'googlemaps';
declare let System: SystemJS;

interface SystemJS {
  import: (path?: string) => Promise<any>;
}
// Extra variables that live on Global that will be replaced by webpack DefinePlugin
declare let ENV: string;
declare let HMR: boolean;
interface GlobalEnvironment {
  ENV;
  HMR;
  SystemJS: SystemJS;
  System: SystemJS;
}

interface WebpackModule {
  hot: {
    data?: any,
    idle: any,
    accept(dependencies?: string | string[], callback?: (updatedDependencies?: any) => void): void;
    decline(dependencies?: string | string[]): void;
    dispose(callback?: (data?: any) => void): void;
    addDisposeHandler(callback?: (data?: any) => void): void;
    removeDisposeHandler(callback?: (data?: any) => void): void;
    check(autoApply?: any, callback?: (err?: Error, outdatedModules?: any[]) => void): void;
    apply(options?: any, callback?: (err?: Error, outdatedModules?: any[]) => void): void;
    status(callback?: (status?: string) => void): void | string;
    removeStatusHandler(callback?: (status?: string) => void): void;
  };
}

interface WebpackRequire {
  context(file: string, flag?: boolean, exp?: RegExp): any;
}

// Extend typings
/* eslint-disable @typescript-eslint/no-empty-interface */
interface NodeRequire extends WebpackRequire { }
interface NodeModule extends WebpackModule { }
interface Global extends GlobalEnvironment { }
/* eslint-enable @typescript-eslint/no-empty-interface */

// Allows us to import json files in typescript
// See https://hackernoon.com/import-json-into-typescript-8d465beded79#.88tfoy2df
declare module '*.json' {
  const value: any;
  export default value;
}

declare module 'reflect-metadata';

declare module '*.scss' {
  const content: any;
  export default content;
}
