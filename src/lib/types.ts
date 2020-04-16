import { Component } from 'endorphin';
// import { EmmetStore } from './lib/store';

export type ParseModeError = Error & { ch?: number };
export type SyntaxType = 'markup' | 'stylesheet';
export type EmComponent<P = any, S = any> = Component<P, S>;
