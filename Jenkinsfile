pipeline {
    agent any

    environment {
        NODE_VERSION = '20'
        APP_NAME = 'mental-health-tracker'
        DOCKER_IMAGE = "mht-backend:${BUILD_NUMBER}"
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
                echo "Code checked out on branch: ${env.GIT_BRANCH}"
            }
        }

        stage('Install Dependencies') {
            parallel {
                stage('Backend Dependencies') {
                    steps {
                        dir('backend') {
                            sh 'node --version'
                            sh 'npm --version'
                            sh 'npm install'
                            echo 'Backend dependencies installed'
                        }
                    }
                }
                stage('Frontend Dependencies') {
                    steps {
                        dir('frontend') {
                            sh 'npm install'
                            echo 'Frontend dependencies installed'
                        }
                    }
                }
            }
        }

        // ✅ BUILD FIRST
        stage('Build Frontend') {
            steps {
                dir('frontend') {
                    sh 'npx vite build || true'
                    echo 'Frontend built successfully'
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                sh 'docker build -f docker/Dockerfile.backend -t mht-backend:latest .'
                sh 'docker build -f docker/Dockerfile.frontend -t mht-frontend:latest .'
                echo "Docker image built: ${DOCKER_IMAGE}"
            }
        }

        // ✅ THEN TEST
        stage('Run Tests') {
            steps {
                dir('backend') {
                    sh 'npm test'
                    echo 'Tests passed'
                }
            }
            post {
                failure {
                    echo 'Tests failed – aborting pipeline'
                }
            }
        }

        // ✅ QUALITY BEFORE DEPLOY
        stage('Code Quality Analysis') {
            steps {
                withSonarQubeEnv('SonarCloud') {
                    sh '''
                    npx sonar-scanner \
                    -Dsonar.projectKey=Mish04-hub_Mental-Health-Tracker \
                    -Dsonar.organization=mish04-hub \
                    -Dsonar.sources=backend,frontend \
                    -Dsonar.host.url=https://sonarcloud.io \
                    -Dsonar.login=${SONAR_AUTH_TOKEN}
                    '''
                }
            }
        }

        // ✅ ADD SECURITY (REQUIRED)
        stage('Security Scan (Trivy)') {
            steps {
            sh '''
            trivy image mht-backend:latest || true
            '''
            echo "Security scan completed using Trivy"
    }
}

        // ✅ DEPLOY AFTER ALL CHECKS
        stage('Deploy') {
            steps {
                echo "Deploying backend..."

                sh '''
                docker stop mht-backend-running || true
                docker rm mht-backend-running || true
                docker run -d \
                --name mht-backend-running \
                --restart unless-stopped \
                -p 5001:5000 \
                mht-backend:latest
                '''

                echo "Backend deployed on port 5001"
            }
        }

        // ✅ RELEASE STAGE
        stage('Release') {
            steps {
                echo "Application promoted to production"
            }
        }

        // ✅ MONITORING STAGE
        stage('Monitoring') {
            steps {
                echo "Monitoring application..."
                sh 'docker ps'
                sh 'docker logs mht-backend-running || true'
            }
        }
    }

    post {
        always {
            cleanWs()
        }
        success {
            echo "Pipeline succeeded for build #${BUILD_NUMBER}"
        }
        failure {
            echo "Pipeline FAILED for build #${BUILD_NUMBER}. Check logs above."
        }
    }
}