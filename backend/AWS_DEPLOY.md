# Manual AWS Deployment Guide (Web UI / Dashboard)

This guide walks you through setting up a production-ready Backend on AWS using EC2, Auto Scaling (ASG), and a Load Balancer (ALB) **manually via the AWS Web Dashboard (Website)**.

> **⚠️ CRITICAL**: Read the "Before You Start" section below to avoid deployment failures!

---

## Before You Start - Critical Fixes

### 1. Fix Environment File Line Endings
**Problem**: Windows line endings (CRLF) break environment variables on Linux servers.

**Solution** (Run in PowerShell):
```powershell
cd backend
(Get-Content ".env" -Raw) -replace "`r`n", "`n" | Set-Content ".env" -NoNewline
```

### 2. Verify Firebase Credentials
Ensure your `.env` file includes:
```bash
FIREBASE_SERVICE_ACCOUNT_BASE64=ewogICJ0eXBlIjogInNlcn... (your base64 string)
```

### 3. No Spaces Around Equals Signs
**Wrong**: `MONGO_URI = mongodb://...`  
**Correct**: `MONGO_URI=mongodb://...`

---

## 1. Prerequisites
- **AWS Account** (Login to the [AWS Management Console](https://console.aws.amazon.com/)).
- **Local Terminal**: PowerShell or Command Prompt to upload Docker images.
- **Secrets Prepared**: Ensure `.env` file has Unix line endings (LF) and all variables.

---

## 2. Infrastructure Setup (Networking)

### A. Security Groups
1.  **ALB Security Group** (`bookaly-alb-sg`):
    - **Inbound**: default HTTP (80) from `0.0.0.0/0` (Anywhere).
2.  **EC2 Security Group** (`bookaly-ec2-sg`):
    - **Inbound**: Custom TCP (3000) from `bookaly-alb-sg` (Select the SG you just created as source).
    - **Outbound**: Allow All (default).

---

## 3. Compute Setup

### A. Create IAM Role
1.  Go to **IAM** -> **Roles** -> **Create Role**.
2.  Select **EC2**.
3.  Add Permissions:
    - `AmazonEC2ContainerRegistryReadOnly` (To pull images).
    - `AmazonSSMManagedInstanceCore` (Search for **`SSMManaged`** or **`Core`** to find it easily).
4.  Name it: `ec2-ecr-role`.

### B. Create Launch Template
1.  Go to **EC2** -> **Launch Templates** -> **Create**.
2.  **Name**: `bookaly-backend-lt`.
3.  **AMI**: Amazon Linux 2023 (`al2023-ami-kernel-6.1...`).
4.  **Instance Type**: `t3.micro` (Free Tier usage: 750hrs/mo).
5.  **Key Pair**: *None* (We use SSM for security).
6.  **Network Settings**: Select `bookaly-ec2-sg`.
7.  **Advanced Details**:
    - **IAM Instance Profile**: `ec2-ecr-role`.
    - **User Data**: Paste the **MIME-wrapped** script below:

    > **⚠️ IMPORTANT**: Cloud-init requires MIME format. Copy this EXACTLY, replacing only the values in the .env section!

    ```
    Content-Type: multipart/mixed; boundary="//"
    MIME-Version: 1.0

    --//
    Content-Type: text/x-shellscript; charset="us-ascii"
    MIME-Version: 1.0
    Content-Transfer-Encoding: 7bit
    Content-Disposition: attachment; filename="userdata.txt"

    #!/bin/bash
    yum update -y
    yum install -y docker
    service docker start
    usermod -a -G docker ec2-user
    aws ecr get-login-password --region ap-south-1 | docker login --username AWS --password-stdin 102212212969.dkr.ecr.ap-south-1.amazonaws.com

    cat <<EOF > /home/ec2-user/.env
    MONGO_URI=mongodb+srv://YOUR_USER:YOUR_PASS@cluster0.xxxxx.mongodb.net/YOUR_DB?retryWrites=true&w=majority&appName=Cluster0
    COOKIE_PASSWORD=your_cookie_password_here
    ACCESS_TOKEN_SECRET=your_access_token_secret
    REFRESH_TOKEN_SECRET=your_refresh_token_secret
    CLOUDINARY_CLOUD_NAME=your_cloud_name
    CLOUDINARY_API_KEY=your_api_key
    CLOUDINARY_API_SECRET=your_api_secret
    FIREBASE_SERVICE_ACCOUNT_BASE64=your_base64_encoded_firebase_json_here
    EOF

    docker pull 102212212969.dkr.ecr.ap-south-1.amazonaws.com/bookaly-backend:latest
    docker run -d --name bookaly-backend --restart always -p 3000:3000 --env-file /home/ec2-user/.env 102212212969.dkr.ecr.ap-south-1.amazonaws.com/bookaly-backend:latest
    --//--
    ```

    **Replace these placeholders**:
    - `YOUR_USER`, `YOUR_PASS`, `YOUR_DB` in MONGO_URI
    - All `your_*` values with actual credentials from your `.env` file
    - Ensure NO spaces around `=` signs
    - Keep everything on single lines (no line breaks within values)

---

## 4. Scaling & Load Balancing

### A. Create Auto Scaling Group (ASG)
1.  Go to **EC2** -> **Auto Scaling Groups** -> **Create**.
2.  **Name**: `bookaly-backend-asg`.
3.  **Launch Template**: Select `bookaly-backend-lt`.
4.  **Network**: Select your VPC and all 3 availability zones (`ap-south-1a`, `1b`, `1c`).
5.  **Load Balancing**:
    - Attach to a **new Load Balancer**.
    - Type: **Application Load Balancer**.
    - Name: `bookaly-backend-alb`.
    - Scheme: **Internet-facing**.
    - Subnets: All 3 (public).
    - Default Routing: Create a target group `bookaly-tg-3000`.
6.  **Target Group Settings** (IMPORTANT):
    - **Port**: `3000` (NOT 80!)
    - **Health Check Path**: `/admin`
    - **Health Check Matcher**: `200-302` (to accept redirects)
    - **Healthy Threshold**: 5
    - **Interval**: 30 seconds
7.  **Group Size**:
    - Desired: 1
    - Min: 1
    - Max: 3
8.  **Health Checks**:
    - Turn on ELB health checks
    - Grace period: 300 seconds
9.  **Review & Create**.

### B. Configure Scaling Policy
1.  Open your new ASG -> **Automatic Scaling**.
2.  **Create dynamic scaling policy**.
3.  Type: **Target Tracking**.
4.  Metric: Average CPU Utilization.
5.  Target Value: **70**.

---

## 5. Verification

1.  Wait ~5 minutes for the instance to launch.
2.  Go to **Load Balancers** -> Select `bookaly-backend-alb`.
3.  Copy the **DNS Name** (e.g., `bookaly-backend-alb-123.ap-south-1.elb.amazonaws.com`).
4.  Test endpoints:
    - `/admin` - Should return 200 OK (admin panel)
    - `/` - May return 404 (expected, no root route)

### Troubleshooting

#### Instance Unhealthy in Target Group
1. Check Security Group allows TCP 3000 from ALB
2. Verify health check path is `/admin` and matcher is `200-302`
3. Connect via SSM to check Docker logs:
   ```bash
   aws ssm send-command \
     --instance-ids i-XXXXXXXXX \
     --document-name "AWS-RunShellScript" \
     --parameters 'commands=["sudo docker ps -a","sudo docker logs bookaly-backend"]'
   ```

#### Application Not Starting
1. **Check environment variables**: Connect to instance and verify `.env`:
   ```bash
   sudo cat /home/ec2-user/.env
   ```
   - Ensure NO spaces around `=`
   - Verify all values are on single lines (no line breaks)

2. **Check Docker container**:
   ```bash
   sudo docker ps -a
   sudo docker logs bookaly-backend
   ```

#### 502 Bad Gateway
- Wait for health checks to pass (needs 5 consecutive successes @ 30s = 2.5 minutes)
- Verify Target Group shows instances as "healthy"
- Check ALB listener forwards to correct Target Group on port 3000

---

## How to Redeploy (Update App)

### Step 1: Upload New Code (Local Terminal)
Run these commands in your **VS Code Terminal**:
```powershell
cd backend
docker build -t bookaly-backend .
# Login
aws ecr get-login-password --region ap-south-1 | docker login --username AWS --password-stdin 102212212969.dkr.ecr.ap-south-1.amazonaws.com
docker tag bookaly-backend:latest 102212212969.dkr.ecr.ap-south-1.amazonaws.com/bookaly-backend:latest
docker push 102212212969.dkr.ecr.ap-south-1.amazonaws.com/bookaly-backend:latest
```

### Step 2: Refresh Servers (AWS Web Dashboard)
1.  Go to **EC2 Dashboard** -> **Auto Scaling Groups** (left sidebar).
2.  Click on `bookaly-backend-asg` to open its details.
3.  In the bottom panel, click the **Instance refresh** tab (between "Automatic scaling" and "Instance management").
4.  Click **Start instance refresh** button (orange button on the right).
5.  Leave default settings and click **Start instance refresh** to confirm.
6.  Wait 5-10 minutes - ASG will automatically:
    - Launch new instances with latest code
    - Wait for them to become healthy
    - Terminate old instances

**Progress tracking**: Stay on the "Instance refresh" tab to see real-time status.

---

## Cost Optimization

- **t3.micro**: Free Tier eligible (750 hrs/month for 12 months)
- **ALB**: ~$16-18/month
- **Data Transfer**: First 100 GB free/month
- **Auto-scaling**: Only pay for running instances

**Monthly Estimate**: $0-5 (with Free Tier) or $20-30 (without Free Tier)
