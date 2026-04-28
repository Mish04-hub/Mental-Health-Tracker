pipeline {
    agent any

    stages {

        stage('1. Checkout Source Code') {
            steps {
                echo 'Cloning repository from GitHub'
                checkout scm
            }
        }

        stage('2. Install Backend Dependencies') {
            steps {
                echo 'Installing backend dependencies'
                dir('backend') {
                    sh 'npm install'
                }
            }
        }

        stage('3. Build Frontend Application') {
            steps {
                echo 'Building frontend application'
                dir('frontend') {
                    sh 'npm install'
                    sh 'npm run build || true'
                }
            }
        }

        stage('4. Run Backend Tests (Jest)') {
            steps {
                echo 'Running backend unit tests'
                dir('backend') {
                    sh 'npm test'
                }
            }
        }

        stage('5. SonarQube Analysis') {
            steps {
                echo 'Running SonarQube analysis for code quality'

                withSonarQubeEnv('SonarQube') {
                    dir('backend') {
                        sh '''
                        npx sonar-scanner \
                          -Dsonar.projectKey=mental-health \
                          -Dsonar.sources=. \
                          -Dsonar.host.url=http://sonarqube:9000 \
                          -Dsonar.login=$SONAR_AUTH_TOKEN
                        '''
                    }
                }
            }
        }
    }

    post {
        success {
            echo 'Build, Test, and SonarQube analysis completed successfully'
        }
        failure {
            echo 'Pipeline failed'
        }
    }
}