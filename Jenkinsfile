pipeline {
  agent any

  options {
    timestamps()
    skipDefaultCheckout(true)
    disableConcurrentBuilds()
  }

  environment {
    CI = 'true'
    NODE_ENV = 'test'
  }
tools {
    nodejs "node2631"
    }
  stages {    
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Install') {
      steps {
        dir('medical-app') {
          sh 'npm ci'
        }
      }
    }

    stage('Lint') {
      steps {
        dir('medical-app') {
          sh 'npm run lint'
        }
      }
    }

    stage('Backend Tests') {
      steps {
        dir('medical-app') {
          sh '''
            if npm run | grep -q "test:backend"; then
              npm run test:backend
            else
              echo "test:backend not found, falling back to npm test"
              npm test
            fi
          '''
        }
      }
    }

    stage('Frontend Tests') {
      steps {
        dir('medical-app') {
          sh '''
            if npm run | grep -q "test:frontend"; then
              npm run test:frontend
            else
              echo "test:frontend not found, skipping dedicated frontend stage"
            fi
          '''
        }
      }
    }

    stage('Build') {
      steps {
        dir('medical-app') {
          sh 'npm run build'
        }
      }
    }

    stage('Database Verification') {
      steps {
        dir('medical-app') {
          sh '''
            if [ -z "${DATABASE_URL:-}" ]; then
              echo "DATABASE_URL not set, skipping database verification"
            else
              npm run db:check
            fi
          '''
        }
      }
    }
  }

  post {
    success {
      echo 'CI passed. Merge can proceed.'
      script {
        if (env.CHANGE_ID) {
          try {
            def repoPath = sh(script: 'git config --get remote.origin.url', returnStdout: true).trim()
              .replaceAll(/.*github\.com[\/:]/,  '')
              .replaceAll(/\.git$/, '')
            withCredentials([string(credentialsId: 'github-scm-credentials', variable: 'GH_TOKEN')]) {
              sh """
                curl -s -o /dev/null \\
                  -H 'Authorization: token ${GH_TOKEN}' \\
                  -H 'Content-Type: application/json' \\
                  -X POST \\
                  -d '{"body":"CI passed for PR #${env.CHANGE_ID}. Build: ${env.BUILD_URL}"}' \\
                  https://api.github.com/repos/${repoPath}/issues/${env.CHANGE_ID}/comments || true
              """
            }
          } catch (e) {
            echo "Could not post PR comment: ${e.message}"
          }
        }
      }
    }

    failure {
      echo 'CI failed. Please check the logs.'
      script {
        if (env.CHANGE_ID) {
          try {
            def repoPath = sh(script: 'git config --get remote.origin.url', returnStdout: true).trim()
              .replaceAll(/.*github\.com[\/:]/,  '')
              .replaceAll(/\.git$/, '')
            withCredentials([string(credentialsId: 'github-scm-credentials', variable: 'GH_TOKEN')]) {
              sh """
                curl -s -o /dev/null \\
                  -H 'Authorization: token ${GH_TOKEN}' \\
                  -H 'Content-Type: application/json' \\
                  -X POST \\
                  -d '{"body":"CI failed for PR #${env.CHANGE_ID}. Build: ${env.BUILD_URL}"}' \\
                  https://api.github.com/repos/${repoPath}/issues/${env.CHANGE_ID}/comments || true
              """
            }
          } catch (e) {
            echo "Could not post PR comment: ${e.message}"
          }
        }
      }
    }
  }
}