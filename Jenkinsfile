pipeline {
    agent any

    environment {
        SONARQUBE_ENV = 'SonarQube'
    }

    stages {

        stage('Checkout') {
            steps {
                echo 'Cloning repository'
                checkout scm
            }
        }

        stage('Backend Install') {
            steps {
                echo 'Installing backend dependencies'
                dir('backend') {
                    sh 'npm install'
                }
            }
        }

        stage('Frontend Build') {
            steps {
                echo 'Building frontend'
                dir('frontend') {
                    sh 'npm install'
                    sh 'npm run build'
                }
            }
        }

        stage('Test (Jest)') {
            steps {
                echo 'Running tests with coverage'
                dir('backend') {
                    sh 'NODE_ENV=test npm test'
                }
            }
        }

        stage('SonarQube Analysis') {
            steps {
                echo 'Running SonarQube analysis'
                withSonarQubeEnv("${SONARQUBE_ENV}") {
                    dir('backend') {
                        sh '''
                        npx sonar-scanner \
                        -Dsonar.projectKey=mental-health \
                        -Dsonar.projectName="Mental Health Tracker" \
                        -Dsonar.sources=. \
                        -Dsonar.host.url=http://host.docker.internal:9000 \
                        -Dsonar.login=$SONAR_AUTH_TOKEN \
                        -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info
                        '''
                    }
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                echo 'Building Docker images'
                sh 'docker build -t docker-backend -f docker/backend.Dockerfile .'
                sh 'docker build -t docker-frontend -f docker/frontend.Dockerfile .'
            }
        }

        stage('Trivy Security Scan') {
            steps {
                echo 'Running Trivy scan'

                sh '''
                docker run --rm \
                -v trivy-cache:/root/.cache/ \
                aquasec/trivy image --download-db-only || true

                docker run --rm \
                -v /var/run/docker.sock:/var/run/docker.sock \
                -v trivy-cache:/root/.cache/ \
                aquasec/trivy image \
                --severity HIGH,CRITICAL \
                --exit-code 0 \
                docker-backend || true

                docker run --rm \
                -v /var/run/docker.sock:/var/run/docker.sock \
                -v trivy-cache:/root/.cache/ \
                aquasec/trivy image \
                --severity HIGH,CRITICAL \
                --exit-code 0 \
                docker-frontend || true
                '''
            }
        }

        stage('Trivy Report') {
            steps {
                echo 'Generating reports'

                sh '''
                docker run --rm \
                -v $(pwd):/output \
                -v /var/run/docker.sock:/var/run/docker.sock \
                -v trivy-cache:/root/.cache/ \
                aquasec/trivy image \
                --format template \
                --template "@contrib/html.tpl" \
                -o /output/backend-report.html \
                docker-backend || true

                docker run --rm \
                -v $(pwd):/output \
                -v /var/run/docker.sock:/var/run/docker.sock \
                -v trivy-cache:/root/.cache/ \
                aquasec/trivy image \
                --format json \
                -o /output/frontend-report.json \
                docker-frontend || true
                '''
            }
        }

        stage('Docker Deploy') {
            steps {
                echo 'Deploying application'

                sh '''
                docker rm -f backend-container || true
                docker rm -f frontend-container || true

                docker run -d --name backend-container -p 5001:5000 docker-backend
                docker run -d --name frontend-container -p 3001:80 docker-frontend
                '''
            }
        }
    }

    post {
        success {
            echo 'Pipeline completed successfully'
        }
        failure {
            echo 'Pipeline failed'
        }
        always {
            echo 'Archiving reports'
            archiveArtifacts artifacts: 'backend-report.html, frontend-report.json', fingerprint: true
        }
    }
}