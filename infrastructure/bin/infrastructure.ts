#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { NewhillSpicesStack } from '../lib/newhill-spices-stack';

const app = new cdk.App();

// Get environment from context or default to 'dev'
const env = app.node.tryGetContext('env') || 'dev';
const account = process.env.CDK_DEFAULT_ACCOUNT;
const region = process.env.CDK_DEFAULT_REGION || 'us-east-1';

// Create the main stack
new NewhillSpicesStack(app, `NewhillSpices-${env}`, {
  env: {
    account,
    region,
  },
  description: `Newhill Spices Platform - ${env} environment`,
  tags: {
    Environment: env,
    Project: 'NewhillSpices',
    ManagedBy: 'CDK',
  },
});

app.synth();
