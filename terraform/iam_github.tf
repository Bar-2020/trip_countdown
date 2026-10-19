# Optional: lets GitHub Actions deploy without stored AWS keys. Some accounts, such as the
# ones in the new AWS experience, forbid creating an OIDC provider with a service control
# policy. Set enable_github_deploy = false there and deploy from your own computer (see the
# README). An account can also have only one OIDC provider per URL: if this one already has
# one for token.actions.githubusercontent.com, import it instead of creating it.

# These resources used to be created unconditionally. The moved blocks keep an existing
# deployment from destroying and recreating them now that they have a count.
moved {
  from = aws_iam_openid_connect_provider.github
  to   = aws_iam_openid_connect_provider.github[0]
}

moved {
  from = aws_iam_role.deploy
  to   = aws_iam_role.deploy[0]
}

moved {
  from = aws_iam_role_policy.deploy
  to   = aws_iam_role_policy.deploy[0]
}

resource "aws_iam_openid_connect_provider" "github" {
  count = var.enable_github_deploy ? 1 : 0

  url            = "https://token.actions.githubusercontent.com"
  client_id_list = ["sts.amazonaws.com"]
}

data "aws_iam_policy_document" "github_assume_role" {
  count = var.enable_github_deploy ? 1 : 0

  statement {
    actions = ["sts:AssumeRoleWithWebIdentity"]

    principals {
      type        = "Federated"
      identifiers = [aws_iam_openid_connect_provider.github[0].arn]
    }

    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:aud"
      values   = ["sts.amazonaws.com"]
    }

    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:sub"
      values   = ["repo:${var.github_repo}:ref:refs/heads/main"]
    }
  }
}

resource "aws_iam_role" "deploy" {
  count = var.enable_github_deploy ? 1 : 0

  name               = "${var.project_name}-deploy"
  assume_role_policy = data.aws_iam_policy_document.github_assume_role[0].json
}

data "aws_iam_policy_document" "deploy" {
  count = var.enable_github_deploy ? 1 : 0

  statement {
    actions   = ["s3:ListBucket"]
    resources = [aws_s3_bucket.site.arn]
  }

  statement {
    actions   = ["s3:PutObject", "s3:DeleteObject"]
    resources = ["${aws_s3_bucket.site.arn}/*"]
  }

  statement {
    actions   = ["cloudfront:CreateInvalidation"]
    resources = [aws_cloudfront_distribution.site.arn]
  }
}

resource "aws_iam_role_policy" "deploy" {
  count = var.enable_github_deploy ? 1 : 0

  name   = "deploy-site"
  role   = aws_iam_role.deploy[0].id
  policy = data.aws_iam_policy_document.deploy[0].json
}
