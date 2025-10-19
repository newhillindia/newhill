import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as logs from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';

export class LambdaFunctions extends Construct {
  public readonly cacheInvalidationFunction: lambda.Function;
  public readonly imageProcessingFunction: lambda.Function;
  public readonly emailNotificationFunction: lambda.Function;
  public readonly apiGateway: apigateway.RestApi;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    // Cache invalidation Lambda
    this.cacheInvalidationFunction = new lambda.Function(this, 'CacheInvalidationFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromInline(`
        const { CloudFrontClient, CreateInvalidationCommand } = require('@aws-sdk/client-cloudfront');
        
        exports.handler = async (event) => {
          const cloudfront = new CloudFrontClient({ region: process.env.AWS_REGION });
          
          try {
            const command = new CreateInvalidationCommand({
              DistributionId: process.env.DISTRIBUTION_ID,
              InvalidationBatch: {
                CallerReference: Date.now().toString(),
                Paths: {
                  Quantity: 1,
                  Items: ['/*']
                }
              }
            });
            
            const result = await cloudfront.send(command);
            console.log('Cache invalidation created:', result);
            
            return {
              statusCode: 200,
              body: JSON.stringify({
                message: 'Cache invalidated successfully',
                invalidationId: result.Invalidation?.Id
              })
            };
          } catch (error) {
            console.error('Error invalidating cache:', error);
            throw error;
          }
        };
      `),
      environment: {
        DISTRIBUTION_ID: process.env.CLOUDFRONT_DISTRIBUTION_ID || '',
        AWS_REGION: process.env.AWS_REGION || 'us-east-1',
      },
      timeout: cdk.Duration.minutes(5),
      memorySize: 256,
      logRetention: logs.RetentionDays.ONE_MONTH,
    });

    // Image processing Lambda
    this.imageProcessingFunction = new lambda.Function(this, 'ImageProcessingFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromInline(`
        const { S3Client, GetObjectCommand, PutObjectCommand } = require('@aws-sdk/client-s3');
        const sharp = require('sharp');
        
        exports.handler = async (event) => {
          const s3 = new S3Client({ region: process.env.AWS_REGION });
          
          try {
            const { bucket, key, sizes = [200, 400, 800] } = JSON.parse(event.body);
            
            // Get original image from S3
            const getCommand = new GetObjectCommand({
              Bucket: bucket,
              Key: key
            });
            
            const response = await s3.send(getCommand);
            const imageBuffer = await response.Body.transformToByteArray();
            
            // Process image for different sizes
            const processedImages = await Promise.all(
              sizes.map(async (size) => {
                const processedBuffer = await sharp(imageBuffer)
                  .resize(size, size, { fit: 'inside', withoutEnlargement: true })
                  .jpeg({ quality: 80 })
                  .toBuffer();
                
                const processedKey = \`processed/\${size}/\${key}\`;
                
                const putCommand = new PutObjectCommand({
                  Bucket: bucket,
                  Key: processedKey,
                  Body: processedBuffer,
                  ContentType: 'image/jpeg'
                });
                
                await s3.send(putCommand);
                
                return {
                  size,
                  key: processedKey,
                  url: \`https://\${bucket}.s3.\${process.env.AWS_REGION}.amazonaws.com/\${processedKey}\`
                };
              })
            );
            
            return {
              statusCode: 200,
              body: JSON.stringify({
                message: 'Images processed successfully',
                processedImages
              })
            };
          } catch (error) {
            console.error('Error processing images:', error);
            throw error;
          }
        };
      `),
      environment: {
        AWS_REGION: process.env.AWS_REGION || 'us-east-1',
      },
      timeout: cdk.Duration.minutes(15),
      memorySize: 1024,
      logRetention: logs.RetentionDays.ONE_MONTH,
    });

    // Email notification Lambda
    this.emailNotificationFunction = new lambda.Function(this, 'EmailNotificationFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromInline(`
        const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');
        
        exports.handler = async (event) => {
          const ses = new SESClient({ region: process.env.AWS_REGION });
          
          try {
            const { to, subject, body, type = 'html' } = JSON.parse(event.body);
            
            const command = new SendEmailCommand({
              Source: process.env.FROM_EMAIL,
              Destination: {
                ToAddresses: [to]
              },
              Message: {
                Subject: {
                  Data: subject,
                  Charset: 'UTF-8'
                },
                Body: {
                  [type === 'html' ? 'Html' : 'Text']: {
                    Data: body,
                    Charset: 'UTF-8'
                  }
                }
              }
            });
            
            const result = await ses.send(command);
            console.log('Email sent successfully:', result);
            
            return {
              statusCode: 200,
              body: JSON.stringify({
                message: 'Email sent successfully',
                messageId: result.MessageId
              })
            };
          } catch (error) {
            console.error('Error sending email:', error);
            throw error;
          }
        };
      `),
      environment: {
        AWS_REGION: process.env.AWS_REGION || 'us-east-1',
        FROM_EMAIL: process.env.SES_FROM_EMAIL || 'noreply@newhillspices.com',
      },
      timeout: cdk.Duration.minutes(5),
      memorySize: 256,
      logRetention: logs.RetentionDays.ONE_MONTH,
    });

    // API Gateway
    this.apiGateway = new apigateway.RestApi(this, 'NewhillSpicesApi', {
      restApiName: 'Newhill Spices API',
      description: 'API for Newhill Spices Platform',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ['Content-Type', 'Authorization'],
      },
    });

    // Add Lambda integrations to API Gateway
    const cacheInvalidationIntegration = new apigateway.LambdaIntegration(this.cacheInvalidationFunction);
    const imageProcessingIntegration = new apigateway.LambdaIntegration(this.imageProcessingFunction);
    const emailNotificationIntegration = new apigateway.LambdaIntegration(this.emailNotificationFunction);

    // Add routes
    this.apiGateway.root.addResource('cache-invalidate').addMethod('POST', cacheInvalidationIntegration);
    this.apiGateway.root.addResource('image-process').addMethod('POST', imageProcessingIntegration);
    this.apiGateway.root.addResource('email-send').addMethod('POST', emailNotificationIntegration);

    // Grant permissions
    this.cacheInvalidationFunction.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ['cloudfront:CreateInvalidation'],
        resources: ['*'],
      })
    );

    this.imageProcessingFunction.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ['s3:GetObject', 's3:PutObject'],
        resources: ['*'],
      })
    );

    this.emailNotificationFunction.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ['ses:SendEmail'],
        resources: ['*'],
      })
    );
  }
}
