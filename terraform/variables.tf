variable "project_name" {
  description = "Prefix for resource names."
  type        = string
  default     = "trip-countdown"
}

variable "aws_region" {
  description = "Region for the site bucket. CloudFront itself is global."
  type        = string
  default     = "eu-north-1"
}

variable "github_repo" {
  description = "GitHub repository (owner/name) allowed to deploy from its main branch."
  type        = string
  default     = "Bar-2020/trip_countdown"
}

variable "enable_github_deploy" {
  description = "Create the GitHub OIDC provider and deploy role so GitHub Actions can deploy. Set to false if your account's policies deny creating an OIDC provider, then deploy from your own computer."
  type        = bool
  default     = true
}

variable "alert_email" {
  description = "Email address that receives budget alerts."
  type        = string
}
