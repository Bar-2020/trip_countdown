output "site_url" {
  description = "Public URL of the site."
  value       = "https://${aws_cloudfront_distribution.site.domain_name}"
}

output "bucket_name" {
  description = "Save as the S3_BUCKET Actions secret."
  value       = aws_s3_bucket.site.bucket
}

output "distribution_id" {
  description = "Save as the CLOUDFRONT_DISTRIBUTION_ID Actions secret."
  value       = aws_cloudfront_distribution.site.id
}

output "deploy_role_arn" {
  description = "Save as the AWS_ROLE_ARN Actions secret."
  value       = aws_iam_role.deploy.arn
}
