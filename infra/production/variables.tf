variable "instance_type" {
  description = "EC2 instance type for production"
  type        = string
  default     = "t3.micro"
}

variable "key_name" {
  description = "SSH key name"
  type        = string
  default     = "terraform_key_pair"
}

variable "region" {
  description = "AWS region"
  type        = string
  default     = "eu-north-1"
}
