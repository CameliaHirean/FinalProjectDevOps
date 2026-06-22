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

  stages {
    stage('PR Policy Gate') {
      steps {
        script {
          if (!env.CHANGE_ID) {
            error('This pipeline only runs for Pull Requests. Create a branch and open a PR.')
          }

          if (!(env.CHANGE_TARGET in ['main', 'release'])) {
            error("PR target '${env.CHANGE_TARGET}' is not allowed. Use main or release.")
          }
        }
      }
    }

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
          sh 'npm run test:backend'
        }
      }
    }

    stage('Frontend Tests') {
      steps {
        dir('medical-app') {
          sh 'npm run test:frontend'
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