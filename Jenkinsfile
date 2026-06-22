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
        dir('medical-app') ////////gjg{
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
    }

    failure {
      script {
        if (env.CHANGE_ID) {
          dir('medical-app') {
            sh '''
              set +e
              COMMENT="Jenkins CI failed for ${JOB_NAME} #${BUILD_NUMBER}. See ${BUILD_URL}"
              REPO_URL="$(git config --get remote.origin.url)"

              case "$REPO_URL" in
                git@github.com:*)
                  REPO_PATH="${REPO_URL#git@github.com:}"
                  ;;
                https://github.com/*)
                  REPO_PATH="${REPO_URL#https://github.com/}"
                  ;;
                *)
                  REPO_PATH=""
                  ;;
              esac

              REPO_PATH="${REPO_PATH%.git}"

              if [ -n "${GITHUB_TOKEN:-}" ] && [ -n "${CHANGE_ID:-}" ] && [ -n "$REPO_PATH" ]; then
                curl -fsS -X POST \
                  -H "Authorization: Bearer $GITHUB_TOKEN" \
                  -H "Accept: application/vnd.github+json" \
                  "https://api.github.com/repos/$REPO_PATH/issues/$CHANGE_ID/comments" \
                  -d "$(printf '{\"body\":\"%s\"}' "$COMMENT")" >/dev/null || true
              fi
            '''
          }
        }
      }
    }
  }
}