# --- VPC & Subnets ---
data "aws_vpc" "default" {
  default = true
}

data "aws_subnets" "default" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }
}

# --- Security Group ---
resource "aws_security_group" "prod_sg" {
  name        = "prod-blue-green-sg"
  description = "Allow SSH, HTTP, and app traffic"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "Blue App"
    from_port   = 8001
    to_port     = 8001
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "Green App"
    from_port   = 8002
    to_port     = 8002
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# --- IAM Role for EC2 → S3 ---
resource "aws_iam_role" "ec2_role" {
  name = "prod-ec2-s3-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = { Service = "ec2.amazonaws.com" }
      Action = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy" "ec2_s3_policy" {
  name = "prod-ec2-s3-policy"
  role = aws_iam_role.ec2_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = ["s3:*"]
      Resource = "*"
    }]
  })
}

resource "aws_iam_instance_profile" "ec2_profile" {
  name = "prod-ec2-profile"
  role = aws_iam_role.ec2_role.name
}

# --- S3 Bucket for Data Sync ---
resource "aws_s3_bucket" "prod_sync" {
  bucket = "prod-sync-bucket-camelia"
}

# --- User Data Script (Docker + Blue/Green dirs) ---
locals {
  user_data = <<EOF
#!/bin/bash
apt-get update -y
apt-get install -y docker.io
systemctl enable docker
systemctl start docker
usermod -aG docker ubuntu

mkdir -p /opt/blue
mkdir -p /opt/green

echo "blue" > /var/run/blue-green-state
EOF
}

# --- Blue EC2 ---
resource "aws_instance" "blue" {
  ami                    = "ami-03b292fa1437b64db"
  instance_type          = var.instance_type
  subnet_id              = data.aws_subnets.default.ids[0]
  vpc_security_group_ids = [aws_security_group.prod_sg.id]
  iam_instance_profile   = aws_iam_instance_profile.ec2_profile.name
  key_name               = var.key_name
  user_data              = local.user_data

  tags = {
    Name = "prod-blue"
  }
  connection {
    type        = "ssh"
    user        = "ubuntu"
    host        = self.public_ip
    private_key = file(var.ec2_private_key_path)
  }

  provisioner "file" {
    source      = "scripts/"
    destination = "/home/ubuntu/scripts"
  }

  provisioner "remote-exec" {
    inline = [
      "sudo chmod -R +x /home/ubuntu/scripts",
      "echo 'Scripts uploaded for BLUE instance'"
    ]
  }
}

# Elastic IP for BLUE
resource "aws_eip" "blue_eip" {
  domain        = "vpc"
  allocation_id = "eipalloc-028b6920b32205f0c"
}

resource "aws_eip_association" "blue_assoc" {
  instance_id   = aws_instance.blue.id
  allocation_id = aws_eip.blue_eip.id
}


# --- Green EC2 ---
resource "aws_instance" "green" {
  ami                    = "ami-03b292fa1437b64db"
  instance_type          = var.instance_type
  subnet_id              = data.aws_subnets.default.ids[0]
  vpc_security_group_ids = [aws_security_group.prod_sg.id]
  iam_instance_profile   = aws_iam_instance_profile.ec2_profile.name
  key_name               = var.key_name
  user_data              = local.user_data

  tags = {
    Name = "prod-green"
  }
  connection {
    type        = "ssh"
    user        = "ubuntu"
    host        = self.public_ip
    private_key = file(var.ec2_private_key_path)
  }

  provisioner "file" {
    source      = "scripts/"
    destination = "/home/ubuntu/scripts"
  }

  provisioner "remote-exec" {
    inline = [
      "sudo chmod -R +x /home/ubuntu/scripts",
      "echo 'Scripts uploaded for GREEN instance'"
    ]
  }
}

# Elastic IP for GREEN
resource "aws_eip" "green_eip" {
  domain        = "vpc"
  allocation_id = "eipalloc-0d5f4d15ba12120de"
}

resource "aws_eip_association" "green_assoc" {
  instance_id   = aws_instance.green.id
  allocation_id = aws_eip.green_eip.id
}


# --- Nginx EC2 ---
resource "aws_instance" "nginx" {
  ami                    = "ami-03b292fa1437b64db"
  instance_type          = var.instance_type
  subnet_id              = data.aws_subnets.default.ids[0]
  vpc_security_group_ids = [aws_security_group.prod_sg.id]
  key_name               = var.key_name

  user_data = <<EOF
#!/bin/bash
yum update -y
yum install nginx -y
systemctl enable nginx
systemctl start nginx

# Create upstream configs
cat <<EOT > /etc/nginx/conf.d/blue.conf
upstream app {
    server ${aws_instance.blue.private_ip}:8001;
}
server {
    listen 80;
    location / {
        proxy_pass http://app;
    }
}
EOT

cat <<EOT > /etc/nginx/conf.d/green.conf
upstream app {
    server ${aws_instance.green.private_ip}:8002;
}
server {
    listen 80;
    location / {
        proxy_pass http://app;
    }
}
EOT

# Activate blue by default
ln -sf /etc/nginx/conf.d/blue.conf /etc/nginx/conf.d/active.conf
systemctl restart nginx
EOF

  tags = {
    Name = "prod-nginx"
  }
  connection {
    type        = "ssh"
    user        = "ubuntu"
    host        = self.public_ip
    private_key = file(var.ec2_private_key_path)
  }

  provisioner "file" {
    source      = "scripts/"
    destination = "/home/ubuntu/scripts"
  }

  provisioner "remote-exec" {
    inline = [
      "sudo chmod -R +x /home/ubuntu/scripts",
      "echo 'Scripts uploaded for NGINX instance'"
    ]
  }
}

# Elastic IP for NGINX
resource "aws_eip" "nginx_eip" {
  domain        = "vpc"
  allocation_id = "eipalloc-02422f2a06ed54d66"
}

resource "aws_eip_association" "nginx_assoc" {
  instance_id   = aws_instance.nginx.id
  allocation_id = aws_eip.nginx_eip.id
}

