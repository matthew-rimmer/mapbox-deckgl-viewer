import * as route53 from 'aws-cdk-lib/aws-route53';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as targets from 'aws-cdk-lib/aws-route53-targets';
import * as cloudfront_origins from 'aws-cdk-lib/aws-cloudfront-origins';
import { BlockPublicAccess, BucketAccessControl } from 'aws-cdk-lib/aws-s3';
import { RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { config } from "dotenv";

config();

export class MapDeckGlb extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const domainName = process.env.DOMAIN_NAME;

    if (domainName == null) {
      throw new Error("Domain name is not set in environment variables")
    }

    const siteDomain = `www.${domainName}`;

    const hostedZone = new route53.PublicHostedZone(this, `${id}-route53`, {
      zoneName: domainName,
    });

    const certificate = new acm.DnsValidatedCertificate(this, `${id}-certificate`, {
      domainName: domainName,
      subjectAlternativeNames: ['*.' + domainName],
      hostedZone,
      region: 'us-east-1',
    });

    certificate.applyRemovalPolicy(RemovalPolicy.DESTROY)

    const siteBucket = new s3.Bucket(this, id, {
      bucketName: siteDomain,
      publicReadAccess: true,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      blockPublicAccess: BlockPublicAccess.BLOCK_ACLS,
      accessControl: BucketAccessControl.BUCKET_OWNER_FULL_CONTROL,
      websiteIndexDocument: 'index.html',
    })

    const distribution = new cloudfront.Distribution(this, `${id}-cloudfront`, {
      certificate: certificate,
      defaultRootObject: "index.html",
      domainNames: [siteDomain, domainName],
      minimumProtocolVersion: cloudfront.SecurityPolicyProtocol.TLS_V1_2_2021,
      errorResponses: [
        {
          httpStatus: 404,
          responseHttpStatus: 404,
          responsePagePath: 'index.html',
        },
        {
          httpStatus: 403,
          responseHttpStatus: 403,
          responsePagePath: 'index.html',
        }
      ],
      defaultBehavior: {
        origin: new cloudfront_origins.S3Origin(siteBucket),
        compress: true,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      }
    });

    // www.domain-name.com
    new route53.ARecord(this, `${id}-www-alias-record`, {
      zone: hostedZone,
      recordName: siteDomain,
      target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(distribution))
    });

    // domain-name.com
    new route53.ARecord(this, `${id}-alias-record`, {
      zone: hostedZone,
      recordName: domainName,
      target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(distribution))
    });
  }
}