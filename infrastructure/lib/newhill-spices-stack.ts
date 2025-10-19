import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as elasticache from 'aws-cdk-lib/aws-elasticache';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ecsPatterns from 'aws-cdk-lib/aws-ecs-patterns';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import { LambdaFunctions } from './lambda-functions';

export class NewhillSpicesStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // VPC Configuration
    const vpc = new ec2.Vpc(this, 'NewhillVPC', {
      maxAzs: 3,
      natGateways: 2,
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'Public',
          subnetType: ec2.SubnetType.PUBLIC,
        },
        {
          cidrMask: 24,
          name: 'Private',
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
        },
        {
          cidrMask: 24,
          name: 'Database',
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
        },
      ],
    });

    // Security Groups
    const databaseSecurityGroup = new ec2.SecurityGroup(this, 'DatabaseSecurityGroup', {
      vpc,
      description: 'Security group for RDS database',
      allowAllOutbound: false,
    });

    const cacheSecurityGroup = new ec2.SecurityGroup(this, 'CacheSecurityGroup', {
      vpc,
      description: 'Security group for ElastiCache Redis',
      allowAllOutbound: false,
    });

    const applicationSecurityGroup = new ec2.SecurityGroup(this, 'ApplicationSecurityGroup', {
      vpc,
      description: 'Security group for application services',
      allowAllOutbound: true,
    });

    // Allow application to access database
    databaseSecurityGroup.addIngressRule(
      applicationSecurityGroup,
      ec2.Port.tcp(5432),
      'Allow application to access database'
    );

    // Allow application to access cache
    cacheSecurityGroup.addIngressRule(
      applicationSecurityGroup,
      ec2.Port.tcp(6379),
      'Allow application to access Redis cache'
    );

    // RDS PostgreSQL Database
    const database = new rds.DatabaseInstance(this, 'NewhillDatabase', {
      engine: rds.DatabaseInstanceEngine.postgres({
        version: rds.PostgresEngineVersion.VER_15_4,
      }),
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MICRO),
      vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
      },
      securityGroups: [databaseSecurityGroup],
      multiAz: true,
      allocatedStorage: 20,
      maxAllocatedStorage: 100,
      storageEncrypted: true,
      backupRetention: cdk.Duration.days(7),
      deleteAutomatedBackups: false,
      deletionProtection: false, // Set to true for production
      removalPolicy: cdk.RemovalPolicy.DESTROY, // Change to RETAIN for production
    });

    // ElastiCache Redis Cluster
    const cacheSubnetGroup = new elasticache.CfnSubnetGroup(this, 'CacheSubnetGroup', {
      description: 'Subnet group for Redis cache',
      subnetIds: vpc.privateSubnets.map(subnet => subnet.subnetId),
    });

    const cacheCluster = new elasticache.CfnCacheCluster(this, 'NewhillCache', {
      cacheNodeType: 'cache.t3.micro',
      engine: 'redis',
      numCacheNodes: 1,
      vpcSecurityGroupIds: [cacheSecurityGroup.securityGroupId],
      cacheSubnetGroupName: cacheSubnetGroup.ref,
    });

    // S3 Bucket for static assets
    const assetsBucket = new s3.Bucket(this, 'NewhillAssetsBucket', {
      bucketName: `newhill-spices-assets-${this.account}-${this.region}`,
      versioned: true,
      encryption: s3.BucketEncryption.S3_MANAGED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // Change to RETAIN for production
      autoDeleteObjects: true, // Remove for production
    });

    // CloudFront Distribution
    const distribution = new cloudfront.Distribution(this, 'NewhillDistribution', {
      defaultBehavior: {
        origin: new origins.S3Origin(assetsBucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
      },
      additionalBehaviors: {
        '/api/*': {
          origin: new origins.HttpOrigin('api.newhillspices.com'), // Replace with your API domain
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
        },
      },
      priceClass: cloudfront.PriceClass.PRICE_CLASS_100,
    });

    // Route 53 Hosted Zone (optional - if you have a domain)
    // const hostedZone = route53.HostedZone.fromLookup(this, 'HostedZone', {
    //   domainName: 'newhillspices.com',
    // });

    // SSL Certificate (optional - if you have a domain)
    // const certificate = new acm.Certificate(this, 'SSLCertificate', {
    //   domainName: 'newhillspices.com',
    //   subjectAlternativeNames: ['*.newhillspices.com'],
    //   validation: acm.CertificateValidation.fromDns(hostedZone),
    // });

    // ECS Cluster
    const cluster = new ecs.Cluster(this, 'NewhillCluster', {
      vpc,
      clusterName: 'newhill-spices-cluster',
    });

    // ECS Task Definition for Web Application
    const webTaskDefinition = new ecs.FargateTaskDefinition(this, 'WebTaskDefinition', {
      memoryLimitMiB: 512,
      cpu: 256,
    });

    webTaskDefinition.addContainer('WebContainer', {
      image: ecs.ContainerImage.fromRegistry('newhill-spices-web:latest'),
      portMappings: [{ containerPort: 3000 }],
      environment: {
        NODE_ENV: 'production',
        DATABASE_URL: `postgresql://newhill:password@${database.instanceEndpoint.hostname}:5432/newhill_spices`,
        REDIS_URL: `redis://${cacheCluster.attrRedisEndpointAddress}:6379`,
        NEXT_PUBLIC_API_URL: 'https://api.newhillspices.com',
      },
      logging: ecs.LogDrivers.awsLogs({
        streamPrefix: 'newhill-web',
        logGroup: new logs.LogGroup(this, 'WebLogGroup', {
          logGroupName: '/ecs/newhill-spices/web',
          retention: logs.RetentionDays.ONE_MONTH,
        }),
      }),
    });

    // ECS Service for Web Application
    const webService = new ecsPatterns.ApplicationLoadBalancedFargateService(this, 'WebService', {
      cluster,
      taskDefinition: webTaskDefinition,
      desiredCount: 2,
      publicLoadBalancer: true,
      securityGroups: [applicationSecurityGroup],
      healthCheckGracePeriod: cdk.Duration.seconds(60),
    });

    // ECS Task Definition for API
    const apiTaskDefinition = new ecs.FargateTaskDefinition(this, 'ApiTaskDefinition', {
      memoryLimitMiB: 1024,
      cpu: 512,
    });

    apiTaskDefinition.addContainer('ApiContainer', {
      image: ecs.ContainerImage.fromRegistry('newhill-spices-api:latest'),
      portMappings: [{ containerPort: 3001 }],
      environment: {
        NODE_ENV: 'production',
        DATABASE_URL: `postgresql://newhill:password@${database.instanceEndpoint.hostname}:5432/newhill_spices`,
        REDIS_URL: `redis://${cacheCluster.attrRedisEndpointAddress}:6379`,
        JWT_SECRET: 'your-jwt-secret-key', // Use AWS Secrets Manager in production
        AWS_REGION: this.region,
        S3_BUCKET: assetsBucket.bucketName,
      },
      logging: ecs.LogDrivers.awsLogs({
        streamPrefix: 'newhill-api',
        logGroup: new logs.LogGroup(this, 'ApiLogGroup', {
          logGroupName: '/ecs/newhill-spices/api',
          retention: logs.RetentionDays.ONE_MONTH,
        }),
      }),
    });

    // ECS Service for API
    const apiService = new ecsPatterns.ApplicationLoadBalancedFargateService(this, 'ApiService', {
      cluster,
      taskDefinition: apiTaskDefinition,
      desiredCount: 2,
      publicLoadBalancer: true,
      securityGroups: [applicationSecurityGroup],
      healthCheckGracePeriod: cdk.Duration.seconds(60),
    });

    // Lambda functions and API Gateway
    const lambdaFunctions = new LambdaFunctions(this, 'LambdaFunctions');

    // CloudWatch Alarms
    new cloudwatch.Alarm(this, 'DatabaseCPUAlarm', {
      metric: database.metricCPUUtilization(),
      threshold: 80,
      evaluationPeriods: 2,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    });

    new cloudwatch.Alarm(this, 'WebServiceCPUAlarm', {
      metric: webService.service.metricCpuUtilization(),
      threshold: 80,
      evaluationPeriods: 2,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    });

    new cloudwatch.Alarm(this, 'ApiServiceCPUAlarm', {
      metric: apiService.service.metricCpuUtilization(),
      threshold: 80,
      evaluationPeriods: 2,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    });

    // Outputs
    new cdk.CfnOutput(this, 'DatabaseEndpoint', {
      value: database.instanceEndpoint.hostname,
      description: 'RDS PostgreSQL endpoint',
    });

    new cdk.CfnOutput(this, 'RedisEndpoint', {
      value: cacheCluster.attrRedisEndpointAddress,
      description: 'ElastiCache Redis endpoint',
    });

    new cdk.CfnOutput(this, 'AssetsBucketName', {
      value: assetsBucket.bucketName,
      description: 'S3 bucket for static assets',
    });

    new cdk.CfnOutput(this, 'CloudFrontDistributionId', {
      value: distribution.distributionId,
      description: 'CloudFront distribution ID',
    });

    new cdk.CfnOutput(this, 'WebServiceURL', {
      value: `http://${webService.loadBalancer.loadBalancerDnsName}`,
      description: 'Web service URL',
    });

    new cdk.CfnOutput(this, 'ApiServiceURL', {
      value: `http://${apiService.loadBalancer.loadBalancerDnsName}`,
      description: 'API service URL',
    });

    new cdk.CfnOutput(this, 'LambdaApiGatewayURL', {
      value: lambdaFunctions.apiGateway.url,
      description: 'Lambda API Gateway URL',
    });
  }
}
