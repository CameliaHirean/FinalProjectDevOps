output "blue_public_ip" {
  value = aws_instance.blue.public_ip
}

output "green_public_ip" {
  value = aws_instance.green.public_ip
}

output "nginx_public_ip" {
  value = aws_instance.nginx.public_ip
}

output "blue_private_ip" {
  value = aws_instance.blue.private_ip
}

output "green_private_ip" {
  value = aws_instance.green.private_ip
}

output "s3_bucket_name" {
  value = aws_s3_bucket.prod_sync.bucket
}
