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

variable "alert_email" {
  description = "Email address that receives budget alerts."
  type        = string
}
