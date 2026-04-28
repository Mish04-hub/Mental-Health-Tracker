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

        stage('Docker Deploy') {
            steps {
                echo 'Deploying using Docker Compose'
                sh 'docker compose -f docker/docker-compose.yml down || true'
                sh 'docker compose -f docker/docker-compose.yml up -d --build'
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
    }
}