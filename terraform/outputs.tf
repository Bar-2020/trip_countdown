output "site_url" {
  description = "Public URL of the site."
  value       = "https://${aws_cloudfront_distribution.site.domain_name}"
}

output "bucket_name" {
  description = "Set as the S3_BUCKET Actions variable."
  value       = aws_s3_bucket.site.bucket
}

output "distribution_id" {
  description = "Set as the CLOUDFRONT_DISTRIBUTION_ID Actions variable."
  value       = aws_cloudfront_distribution.site.id
}

output "deploy_role_arn" {
  description = "Set as the AWS_ROLE_ARN Actions variable."
  value       = aws_iam_role.deploy.arn
}
