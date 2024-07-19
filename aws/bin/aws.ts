#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { MapDeckGlb } from '../lib/aws-stack';

const app = new cdk.App();
new MapDeckGlb(app, 'map-deck-glb');