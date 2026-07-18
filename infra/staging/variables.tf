variable "aws_region" {
  description = "AWS region to deploy resources"
  type        = string
  default     = "eu-north-1"
}

variable "aws_profile" {
  description = "AWS CLI profile to use"
  type        = string
  default     = "default"
}

variable "instance_name" {
  description = "Name of the EC2 instance"
  type        = string
  default     = "medical-app-ec2"
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t3.micro"
}

variable "key_name" {
  description = "SSH key pair name"
  type        = string
}

variable "allowed_ssh_ip" {
  description = "IP allowed to SSH into EC2"
  type        = string
  default     = "0.0.0.0/0"
}
